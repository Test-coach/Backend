const { Pool } = require('pg');
const { postgresConfig } = require('../../config/database.config');

// Create a single pool instance
const pool = new Pool(postgresConfig);

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Test the connection immediately
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.error('Database configuration:', {
      host: postgresConfig.connectionString.split('@')[1]?.split(':')[0],
      port: postgresConfig.connectionString.split(':')[2]?.split('/')[0],
      database: postgresConfig.connectionString.split('/').pop(),
      user: postgresConfig.connectionString.split('://')[1]?.split(':')[0]
    });
    process.exit(-1);
  } else {
    console.log('Database connection test successful');
  }
});

// Export the pool instance
module.exports = { pool }; 