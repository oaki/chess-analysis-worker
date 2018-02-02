const zmq = require('zeromq');
const config = require('./config');
const receiver = zmq.socket('pull');
const sender = zmq.socket('push');
const STOCKFISH_PATH = `${__dirname}/stockfish`;
const EngineInterface = require('./EngineInterface');
const throttle = require('lodash').throttle;


receiver.on('message', (data) => {
  const json = JSON.parse(data.toString());
  console.log('3.worker->onMessage', json.action);
  switch (json.action) {
    case 'findBestMove': {
      const engine = new EngineInterface(STOCKFISH_PATH);
      engine.initEngine();

      engine.on('data', throttle((buffer) => {
        const data = engine.prepare(buffer.toString());
        if (data) {
          sender.send(JSON.stringify(data));
          if (engine.delay <= data.time) {
            console.log('worker->senderClose');
            delete engine;
            sender.close();
          }
        }
      }, 500));
      engine.findBestMove(json.fen, json.userId);
    }
  }
});

receiver.connect(config.worker.host1);
sender.connect(config.worker.host2);

process.on('SIGINT', () => {
  receiver.close();
  sender.close();
  process.exit();
});
