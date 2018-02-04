const zmq = require('zeromq');
const receiver = zmq.socket('pull');
const sender = zmq.socket('push');
const STOCKFISH_PATH = `${__dirname}/stockfish`;
const EngineInterface = require('./EngineInterface');
const throttle = require('lodash').throttle;
const os = require('os');
const cpuCount = os.cpus().length;
const isDev = process.argv.indexOf('env=dev') !== -1;
const config = isDev ? require('./config/dev') : require('./config/prod');

if(isDev){
  console.log('Dev');
  console.log(config);
}

receiver.on('message', (data) => {
  const json = JSON.parse(data.toString());
  console.log('3.worker->onMessage', json.action);
  switch (json.action) {
    case 'findBestMove': {
      console.log('findBestMove');
      const engine = new EngineInterface(STOCKFISH_PATH);
      engine.setThreads(cpuCount || 1);
      engine.setSyzygyPath(__dirname + '/../syzygy');
      engine.initEngine();

      engine.on('data', throttle((buffer) => {
        console.log('Buffer', buffer.toString());
        const data = engine.prepare(buffer.toString());
        if (data) {

          sender.send(JSON.stringify(data));
          if (engine.delay <= Number(data[0].time)) {
            console.log('worker->senderClose');
            engine.killEngine();
            delete engine;
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
