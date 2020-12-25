function pairValues(name, str) {
  const tmp = str.split(" ");

  const namePosition = tmp.indexOf(name);

  if (namePosition === -1) {
    return false;
  }

  if (name === "pv") {
    const tmpArr = tmp.splice(namePosition + 1);
    return tmpArr.join(" ");
  }
  return tmp[namePosition + 1];
}

const LINE_MAP = {
  mate: "m",
  score: "s",
  depth: "d",
  pv: "p",
  multipv: "u",
  nodes: "n",
  time: "t",
  nps: "c",
  tbhits: "h",
};

function parseLine(lineStr) {
  const obj = {};
  // console.log("lineStr->", lineStr);
  obj[LINE_MAP.mate] = pairValues("mate", lineStr); // mate
  obj[LINE_MAP.score] = parseFloat(pairValues("cp", lineStr)) / 100; //score
  obj[LINE_MAP.depth] = pairValues("depth", lineStr);
  obj[LINE_MAP.pv] = pairValues("pv", lineStr);
  obj[LINE_MAP.multipv] = pairValues("multipv", lineStr);
  obj[LINE_MAP.nodes] = pairValues("nodes", lineStr);
  obj[LINE_MAP.time] = pairValues("time", lineStr);
  obj[LINE_MAP.nps] = pairValues("nps", lineStr);
  obj[LINE_MAP.tbhits] = pairValues("tbhits", lineStr);

  // console.log("lineStr->Obj", obj);
  return obj;
}


function parseResult(result) {
  if (result.indexOf("info") === -1) {
    return false;
  }
  let lines = result.split("\n");
  lines = lines.filter(line => line.indexOf("info") !== -1 && line.indexOf("pv") !== -1);
  if (lines.length < 1) {
    return false;
  }

  const output = [];

  lines.forEach((line) => {
    const r = parseLine(line);
    output[parseInt(r[LINE_MAP.multipv]) - 1] = r;
  });
  return output;
}

function getFirstMove(pv) {
  return pv.substr(0, 4);
}


function comparePv(prevPv, currentPv) {
  if (!prevPv) {
    return currentPv;
  }

  if (!currentPv) {
    return prevPv;
  }


  if (prevPv === currentPv) {
    return currentPv;
  }

  const length = prevPv.length < currentPv.length ? prevPv.length : currentPv.length;

  let isSame = true;
  for (let i = 0; i < length; i++) {
    if (prevPv[i] !== currentPv[i]) {
      isSame = false;
      break;
    }
  }

  if (isSame) {
    return prevPv.length < currentPv.length ? currentPv : prevPv;
  } else {
    return currentPv;
  }
}

exports.parseLine = parseLine;
exports.parseResult = parseResult;
exports.getFirstMove = getFirstMove;
exports.comparePv = comparePv;
exports.LINE_MAP = LINE_MAP;
