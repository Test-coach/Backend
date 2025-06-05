const { pool } = require('../index');

class MigrationUtil {
  static async initMigrationTable() {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } finally {
      client.release();
    }
  }

  static async getExecutedMigrations() {
    const client = await pool.connect();
    try {
      const { rows } = await client.query('SELECT name FROM migrations ORDER BY id');
      return rows.map(row => row.name);
    } finally {
      client.release();
    }
  }

  static async markMigrationAsExecuted(name) {
    const client = await pool.connect();
    try {
      await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
    } finally {
      client.release();
    }
  }

  static async executeMigration(name, sql) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await this.markMigrationAsExecuted(name);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = MigrationUtil; 