const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve('config/env/development.env') });
const postgresConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
};

module.exports = {
  postgresConfig,
  redisConfig
}; 