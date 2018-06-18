const fs = require('fs');
const path = `${__dirname}/uuid.js`;
const uuidv4 = require('uuid/v4');

module.exports = function createUuid() {
  let uuid = uuidv4();
  if (fs.existsSync(path)) {
    uuid = require('./uuid');
  } else {
    fs.writeFile(path, `module.exports = '${uuid}';`, function (err) {
      if (err) throw err;
      console.log('Saved!', uuid);
    });
  }

  console.log('uuid', uuid);

  return uuid;
};

