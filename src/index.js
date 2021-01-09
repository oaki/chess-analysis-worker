import debounce from "lodash/debounce";
import {io} from "socket.io-client";
import {config} from "./config";
import {createUuid} from "./createUuid";
import * as Engine from "./engine";

console.log("config.api.host", config.api.host);
console.log("config.api.syzygyPath", config.api.syzygyPath);

function init() {
  const socket = io(config.api.host, {
    query: {
      token: createUuid(),
      type: "worker"
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 99999
  });

  socket.on("connect", function (app) {
    console.log("connected->socket.id", socket.id);
    let lastFen = '';

    const emitData = debounce((data) => {
      socket.emit("workerEvaluation", JSON.stringify(data));
    }, 200);

    Engine.initEngine({
      delay: 120 * 1000,
      hash: config.hashSize,
      syzygyPath: config.syzygyPath,
      threads: config.threads,
    });

    Engine.on("data", (buffer) => {
      const data = Engine.prepare(buffer.toString(), lastFen);
      if (data) {
        // console.log("workerEvaluation", data);
        emitData(data);
      }
    });
    socket.on("isReady", (uuid) => {
      console.log("workerIsReady->isReady", uuid);
      socket.emit("workerIsReady", uuid);
    });

    socket.on("setPositionToWorker", (data) => {
      console.log("setPositionToWorker", data);
      Engine.stop();
      Engine.setPosition(data.FEN);
      Engine.setMultiPv(data.multiPv || 1);
      lastFen = data.FEN;
      Engine.go(data.delay || 120 * 1000, data.moves || '');
    });

    socket.on("error", function (error) {
      console.log("error", error);
    });
  });


  socket.on("disconnect", function (e) {
    console.log("disconnect", e);
  });
}

init();
