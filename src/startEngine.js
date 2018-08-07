const config = require("./config");
const STOCKFISH_PATH = `${__dirname}/stockfish`;
const EngineInterface = require("./EngineInterface");
const throttle = require("lodash").throttle;

const os = require("os");
const cpuCount = os.cpus().length;
const tools = require("./tools");

function checkIfEvaluationIsSufficient(engine, data) {
  const evaluation = data[0];
  const time = Number(evaluation[tools.LINE_MAP.time]);
  if (engine.delay <= time) {
    return true;
  }

  const score = Math.abs(Number(evaluation[tools.LINE_MAP.score]));
  const depth = Number(evaluation[tools.LINE_MAP.depth]);
  const isMate = Number(evaluation[tools.LINE_MAP.mate]);

  console.log({score, depth, time, isMate});

  if (isMate && time > 3 * 1000) {
    return true;
  }

  if (!isMate && score > 4 && depth > 20 && time > 3 * 1000) {
    return true;
  }

  return false;
}

const startEngine = (fen, socket, onResultCallback) => {
  console.log("start engine, fen=", fen);
  const engine = new EngineInterface(STOCKFISH_PATH);

  engine.setThreads(cpuCount || 1);
  console.log("syzygy path", __dirname + "/../syzygy");
  engine.setSyzygyPath(__dirname + "/../syzygy");

  engine.setDelay(config.maxTime);

  engine.setHashSize(config.hashSize);

  engine.initEngine();

  let lastPvs = {};

  engine.on("data", ((buffer) => {
    console.log("on->data", buffer.toString());
    const data = engine.prepare(buffer.toString());
    if (data) {

      const dataWithUpdatedPv = data.map((evaluation, index) => {
        if (evaluation[tools.LINE_MAP.pv]) {
          lastPvs[index] = evaluation[tools.LINE_MAP.pv] = tools.comparePv(lastPvs[index], evaluation[tools.LINE_MAP.pv]);
          return evaluation;
        }
      })

      console.log("workerEvaluation", dataWithUpdatedPv);

      onResultCallback(dataWithUpdatedPv);

      if (checkIfEvaluationIsSufficient(engine, data)) {
        console.log("worker->senderClose", data);
        engine.killEngine();
        delete engine;
      }
    }
  }));

  engine.findBestMove(fen);

  return engine;
}

module.exports = startEngine;