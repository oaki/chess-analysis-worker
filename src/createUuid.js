const fs = require("fs");
const uuidv4 = require("uuid/v4");
console.log("process.env.ID", process.env.ID);
const id = (process.env && process.env.ID) || 0;
const path = `${__dirname}/uuid-${Number(id)}.js`;


module.exports = function createUuid() {
  let uuid = uuidv4();
  if (fs.existsSync(path)) {
    uuid = require(path);
  } else {
    fs.writeFile(path, `module.exports = '${uuid}';`, function (err) {
      if (err) throw err;
      console.log("Saved!", uuid);
    });
  }

  console.log("uuid", uuid);

  return uuid;
};

