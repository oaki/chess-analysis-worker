const fs = require("fs");
import { v4 as uuidv4 } from 'uuid';

// import * as uuidv4 from 'uuid/dist/v4';

const id = (process.env && process.env.ID) || 0;
const path = `${__dirname}/uuid-${Number(id)}.js`;

export function createUuid() {
  let uuid = uuidv4();

  if (fs.existsSync(path)) {
    console.log("uuid loaded: ", uuid);
    uuid = require(path);
  } else {
    fs.writeFile(path, `module.exports = '${uuid}';`, function (err) {
      if (err) throw err;
      console.log("Saved!", uuid);
    });
  }

  return uuid;
}

