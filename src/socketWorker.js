require('dotenv').config();
const config = require('./config');
const io = require('socket.io-client');
const uuid = require('./createUuid')();
const startEngine = require('./startEngine');

console.log('config.api.host', config.api.host);

const socket = io(config.api.host, {
  query: {
    token: uuid,
    type: 'worker'
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 99999
});


socket.on('connect', function (app) {
  console.log('connected->socket.id', socket.id);
});


socket.on('setPositionToWorker', (data) => {

  console.log('setPositionToWorker', data);

  startEngine(data.FEN, socket, (data) => {
    socket.emit('workerEvaluation', JSON.stringify(data));
  });

});


socket.on('disconnect', function () {
  console.log('disconnect');
});