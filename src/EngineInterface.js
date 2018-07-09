const spawn = require("child_process").spawn;
const tools = require("./tools");

class EngineInterface {
  constructor(cmd) {
    this.cmd = cmd;
    this.child = spawn(this.cmd, []);
    this.fen = "";
    this.delay = 120 * 1000; // ms
    this.multiPv = 1;
    this.syzygyPath = "";
    this.threads = 1;
    this.hash = 512;
  }

  on(handler, callback) {
    this.child.stdout.on(handler, callback);
  }

  setThreads(threads) {
    this.threads = Number(threads);
  }

  setHash(size) {
    this.hash = Number(size);
  }

  setSyzygyPath(syzygyPath) {
    this.syzygyPath = syzygyPath;
  }

  setDelay(delay) {
    console.log("setDelay", delay);
    this.delay = delay;
  }

  setMultiPv(multiPv) {
    // console.log('setMultiPv');
    this.multiPv = multiPv;
    this.send(`setoption name multipv value ${multiPv}`);
  }

  findBestMove(fen, userId) {
    this.fen = fen;
    this.userId = userId;
    this.send(`position fen ${fen}`);
    this.send(`go movetime ${this.delay}`);
    this.send(`d`);
  }

  send(cmd) {
    console.log(`EngineInterface command: ${cmd}`);
    this.child.stdin.write(`${cmd}\n`);
  }

  prepare(result) {
    console.log("prepare->result", result);
    const obj = tools.parseResult(result);
    if (obj && obj[0]) {
      obj[0].userId = this.userId;
      obj[0].fen = this.fen;
    }

    return obj;
  }

  initEngine() {
    this.send("uci");
    this.send("eval");
    this.send("isready");
    this.send("ucinewgame");
    this.send(`setoption name Threads value ${this.threads}`);
    this.send(`setoption name Hash value ${this.hash}`);
    this.send(`setoption name UCI_AnalyseMode value true`);
    if (this.syzygyPath !== "") {
      this.send(`setoption name SyzygyPath value ${this.syzygyPath}`);
    }
    this.send("setoption name ownbook value false");
    this.send("setoption name Ponder value false");
    this.setMultiPv(this.multiPv);
  }

  killEngine() {
    this.child.kill("SIGINT");
  }
}

module.exports = EngineInterface;
