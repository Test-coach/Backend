const { Pool } = require('pg');
const { postgresConfig } = require('../../../../config/database.config');

const pool = new Pool(postgresConfig);

class Coupon {
  static async create({ code, type, value, maxDiscount, minPurchase, startDate, endDate, maxUses, maxUsesPerUser }) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `INSERT INTO coupons (
          code, type, value, max_discount, min_purchase,
          start_date, end_date, max_uses, max_uses_per_user,
          is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
        RETURNING *`,
        [code, type, value, maxDiscount, minPurchase, startDate, endDate, maxUses, maxUsesPerUser]
      );
      return rows[0];
    } finally {
      client.release();
    }
  }

  static async findByCode(code) {
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        'SELECT * FROM coupons WHERE code = $1 AND is_active = true',
        [code]
      );
      return rows[0];
    } finally {
      client.release();
    }
  }

  static async validateAndApply(code, userId, amount) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [coupon] } = await client.query(
        'SELECT * FROM coupons WHERE code = $1 AND is_active = true FOR UPDATE',
        [code]
      );

      if (!coupon) {
        throw new Error('Coupon not found or inactive');
      }

      // Check validity
      const now = new Date();
      if (now < coupon.start_date || now > coupon.end_date) {
        throw new Error('Coupon has expired');
      }

      if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
        throw new Error('Coupon usage limit reached');
      }

      // Check user usage
      const { rows: [userUsage] } = await client.query(
        'SELECT COUNT(*) as usage_count FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2',
        [coupon.id, userId]
      );

      if (userUsage.usage_count >= coupon.max_uses_per_user) {
        throw new Error('Coupon usage limit reached for this user');
      }

      // Calculate discount
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (amount * coupon.value) / 100;
        if (coupon.max_discount) {
          discount = Math.min(discount, coupon.max_discount);
        }
      } else {
        discount = coupon.value;
      }

      // Update usage count
      await client.query(
        'UPDATE coupons SET uses_count = uses_count + 1 WHERE id = $1',
        [coupon.id]
      );

      // Record usage
      await client.query(
        'INSERT INTO coupon_usage (coupon_id, user_id) VALUES ($1, $2)',
        [coupon.id, userId]
      );

      await client.query('COMMIT');

      return {
        coupon,
        discount
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Coupon; 