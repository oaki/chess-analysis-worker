const STOCKFISH_PATH = `${__dirname}/stockfish`;
const EngineInterface = require('./EngineInterface');
const throttle = require('lodash').throttle;

const os = require('os');
const cpuCount = os.cpus().length;
const tools = require('./tools');

const startEngine = (fen, socket, onResultCallback) => {
  console.log('start engine, fen=', fen);
  const engine = new EngineInterface(STOCKFISH_PATH);

  engine.setThreads(cpuCount || 1);
  engine.setSyzygyPath(__dirname + '/../syzygy');
  engine.setDelay(30000);
  engine.initEngine();

  engine.on('data', throttle((buffer) => {
    console.log('on->data', buffer.toString());
    const data = engine.prepare(buffer.toString());
    if (data) {

      console.log('workerEvaluation', data);

      onResultCallback(data);

      if (engine.delay <= Number(data[0][tools.LINE_MAP.time])) {
        console.log('worker->senderClose');
        engine.killEngine();
        delete engine;
      }
    }
  }, 1000));

  // @todo put user id
  engine.findBestMove(fen, 1);
}

module.exports = startEngine;