const config = require('./config');
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

  if (config.environment === 'development') {
    engine.setDelay(20000);
  } else {
    engine.setDelay(120000);
  }

  engine.initEngine();

  let lastPvs = {};

  engine.on('data', ((buffer) => {
    console.log('on->data', buffer.toString());
    const data = engine.prepare(buffer.toString());
    if (data) {

      const dataWithUpdatedPv = data.map((evaluation, index) => {
        if (evaluation[tools.LINE_MAP.pv]) {
          lastPvs[index] = evaluation[tools.LINE_MAP.pv] = tools.comparePv(lastPvs[index], evaluation[tools.LINE_MAP.pv]);
          return evaluation;
        }
      })

      console.log('workerEvaluation', dataWithUpdatedPv);

      onResultCallback(dataWithUpdatedPv);

      if (engine.delay <= Number(data[0][tools.LINE_MAP.time])) {
        console.log('worker->senderClose');
        engine.killEngine();
        delete engine;
      }
    }
  }));

  // @todo put user id
  engine.findBestMove(fen, 1);

  return engine;
}

module.exports = startEngine;