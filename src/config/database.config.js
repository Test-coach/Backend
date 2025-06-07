const dotenv = require('dotenv');
dotenv.config();
const path = require('path');
const postgresConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

const redisConfig = {
  url: process.env.REDIS_URL
};

const mongoConfig = {
  uri: process.env.MONGO_URI
};

module.exports = {
  postgresConfig,
  redisConfig,
  mongoConfig
}; 