const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { postgresConfig } = require('../../config/database.config');

async function runMigration() {
  const pool = new Pool(postgresConfig);
  const client = await pool.connect();

  try {
    // Read and execute the migration file
    const migrationPath = path.join(__dirname, '001_create_users_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Running database migration...');
    await client.query(migrationSQL);
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration().catch(console.error); 