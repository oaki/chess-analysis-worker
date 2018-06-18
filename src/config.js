 const DEVELOPMENT = 'development';
 const PRODUCTION = 'production';
 const config = {
  environment: process.env.APP_ENVIRONMENT === DEVELOPMENT ? DEVELOPMENT : PRODUCTION,
  api: {
    host: process.env.API_HOST
  }
}

module.exports = config;
