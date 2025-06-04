const { Pool } = require('pg');
const { postgresConfig } = require('../config/database.config');

if (!postgresConfig.connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pgPool = new Pool(postgresConfig);

const getPgPool = () => pgPool;

const query = async (text, params) => {
  const client = await pgPool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};

module.exports = {
  getPgPool,
  query
};