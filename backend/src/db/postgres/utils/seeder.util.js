const { pool } = require('../index');
const bcrypt = require('bcrypt');

class SeederUtil {
  static async seedUsers() {
    const client = await pool.connect();
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO users (email, username, password_hash, role)
        VALUES 
          ('admin@example.com', 'admin', $1, 'admin'),
          ('user@example.com', 'user', $1, 'user')
        ON CONFLICT (email) DO NOTHING
      `, [hashedPassword]);
    } finally {
      client.release();
    }
  }

  static async seedCoupons() {
    const client = await pool.connect();
    try {
      await client.query(`
        INSERT INTO coupons (
          code, type, value, max_discount, min_purchase,
          start_date, end_date, max_uses, max_uses_per_user,
          is_active
        )
        VALUES 
          ('WELCOME10', 'percentage', 10, 1000, 500,
           CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 100, 1, true),
          ('FLAT50', 'fixed', 50, null, 200,
           CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days', 50, 1, true)
        ON CONFLICT (code) DO NOTHING
      `);
    } finally {
      client.release();
    }
  }

  static async clearData() {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Delete data in reverse order of dependencies
      await client.query('DELETE FROM coupon_usage');
      await client.query('DELETE FROM orders');
      await client.query('DELETE FROM coupons');
      await client.query('DELETE FROM users');
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = SeederUtil; 