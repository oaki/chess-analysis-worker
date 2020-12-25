const spawn = require("child_process").spawn;
const tools = require("./tools");
const STOCKFISH_PATH = `${__dirname}/stockfish`;
console.log('STOCKFISH_PATH', STOCKFISH_PATH);
const defaultOptions = {
  fen: "",
  delay: 120 * 1000, // ms
  syzygyPath: "",
  threads: 1,
  hash: 512
}

const stockFishProcess = spawn(STOCKFISH_PATH, []);

stockFishProcess.stderr.on("data", (data) => {
  console.log(`stderr: ${data}`);
});

stockFishProcess.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});

function on(handler, callback) {
  console.log('on', handler, callback);
  stockFishProcess.stdout.on(handler, callback);
}

function setMultiPv(multiPv) {
  send(`setoption name multipv value ${multiPv}`);
}

function setPosition(fen){
  send(`position fen ${fen}`);
}

function go(delay, moves) {
  send(`go movetime ${delay} ${moves}`);
}

function stop() {
  send("stop");
}

function send(cmd) {
  console.log('cmd:', cmd);
  stockFishProcess.stdin.write(`${cmd}\n`);
}

function prepare(result, lastFen) {
  let obj = tools.parseResult(result);
  if (obj) {
    obj = obj.map(o => ({...o, fen: lastFen}));
  }

  return obj;
}

function initEngine(options = {}) {
  console.log('---------------------');
  console.log('initEngine');
  console.log('---------------------');

  send("uci");
  send("eval");
  send("isready");
  send(`setoption name Threads value ${options.threads || defaultOptions.threads}`);
  send(`setoption name Hash value ${options.hash || defaultOptions.hash}`);
  // this.send(`setoption name UCI_AnalyseMode value true`);
  if (options.syzygyPath  !== "") {
    send(`setoption name SyzygyPath value ${options.syzygyPath}`);
  }
  send("setoption name ownbook value false");
  send("setoption name Ponder value false");
}

function killEngine() {
  stockFishProcess.kill("SIGINT");
}

module.exports = {
  initEngine,
  killEngine,
  on,
  stop,
  setPosition,
  go,
  prepare,
  setMultiPv
}