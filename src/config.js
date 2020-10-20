const DEVELOPMENT = "development";
const PRODUCTION = "production";
const config = {
  environment: process.env.APP_ENVIRONMENT === DEVELOPMENT ? DEVELOPMENT : PRODUCTION,
  api: {
    host: process.env.API_HOST
  },
  hashSize: process.env.HASH_SIZE,
  maxTime: process.env.MAX_TIME,
  syzygyPath: process.env.SYZYGY_PATH,
};

module.exports = config;
