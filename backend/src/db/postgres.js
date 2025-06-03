import { Pool } from 'pg';
import { postgresConfig } from '../config/database.config.js';

const pgPool = new Pool(postgresConfig);

export const getPgPool = () => pgPool;

export const query = async (text, params) => {
  const client = await pgPool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
};