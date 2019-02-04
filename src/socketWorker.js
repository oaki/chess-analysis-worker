require("dotenv").config();
const config = require("./config");
const io = require("socket.io-client");
const uuid = require("./createUuid")();
const startEngine = require("./startEngine");
const debounce = require("lodash").debounce;
console.log("config.api.host", config.api.host);

const socket = io(config.api.host, {
  query: {
    token: uuid,
    type: "worker"
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 99999
});

socket.on("connect", function (app) {
  console.log("connected->socket.id", socket.id);
});

const emitData = debounce((data)=>{
  console.log("socket.emit->workerEvaluation", JSON.stringify(data));
  socket.emit("workerEvaluation", JSON.stringify(data));
}, 1000);

let currentEngine = startEngine((data) => {
  emitData(data);
});

socket.on("setPositionToWorker", (data) => {

  console.log("setPositionToWorker", data);

  // if (currentEngine && currentEngine.killEngine) {
  //   console.log('killEngine');
  //   currentEngine.killEngine();
  // }



  currentEngine.stop();
  currentEngine.setPosition(data.FEN);
  currentEngine.go();
});


socket.on("disconnect", function () {
  console.log("disconnect");
});