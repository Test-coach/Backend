const { Pool } = require('pg');
const { postgresConfig } = require('../../../config/database.config');
const pool = new Pool(postgresConfig);

class Order {
  static async create({ 
    userId, 
    courseId, 
    amount, 
    currency, 
    paymentMethod, 
    couponId = null, 
    discountAmount = 0,
    notes = null,
    metadata = null
  }) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Generate order number
      const orderNumber = this.generateOrderNumber();
      
      // Calculate access expiry (1 year from now)
      const accessExpiry = this.calculateAccessExpiry();
      
      const { rows } = await client.query(
        `INSERT INTO orders (
          user_id, course_id, amount, currency, payment_method,
          coupon_id, discount_amount, status, order_number,
          original_amount, access_expiry, notes, metadata,
          payment_status, payment_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8, $9, $10, $11, $12, 'initiated', $13)
        RETURNING *`,
        [
          userId, courseId, amount, currency, paymentMethod, 
          couponId, discountAmount, orderNumber, amount, 
          accessExpiry, notes, metadata, paymentMethod
        ]
      );
      
      await client.query('COMMIT');
      return rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return rows;
  }

  static async findByOrderNumber(orderNumber) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE order_number = $1',
      [orderNumber]
    );
    return rows[0];
  }

  static async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0];
  }

  static async updatePaymentDetails(id, paymentDetails) {
    const {
      transactionId,
      gatewayOrderId,
      gatewayPaymentId,
      status,
      gateway,
      gatewayResponse,
      paidAt
    } = paymentDetails;

    const { rows } = await pool.query(
      `UPDATE orders 
       SET payment_transaction_id = $1,
           payment_gateway_order_id = $2,
           payment_gateway_payment_id = $3,
           payment_status = $4,
           payment_gateway = $5,
           payment_gateway_response = $6,
           payment_paid_at = $7,
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        transactionId,
        gatewayOrderId,
        gatewayPaymentId,
        status,
        gateway,
        gatewayResponse,
        paidAt,
        id
      ]
    );
    return rows[0];
  }

  static async generateInvoice(id, invoiceDetails) {
    const {
      number,
      url,
      generatedAt
    } = invoiceDetails;

    const { rows } = await pool.query(
      `UPDATE orders 
       SET invoice_number = $1,
           invoice_url = $2,
           invoice_generated_at = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [number, url, generatedAt, id]
    );
    return rows[0];
  }

  static async updateMetadata(id, metadata) {
    const { rows } = await pool.query(
      'UPDATE orders SET metadata = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [metadata, id]
    );
    return rows[0];
  }

  static async updateNotes(id, notes) {
    const { rows } = await pool.query(
      'UPDATE orders SET notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [notes, id]
    );
    return rows[0];
  }

  static generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${random}`;
  }

  static calculateAccessExpiry() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // 1 year access
    return date;
  }

  static async getOrdersByDateRange(startDate, endDate) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE created_at BETWEEN $1 AND $2 ORDER BY created_at DESC',
      [startDate, endDate]
    );
    return rows;
  }

  static async getOrdersByStatus(status) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return rows;
  }

  static async getOrdersByPaymentStatus(paymentStatus) {
    const { rows } = await pool.query(
      'SELECT * FROM orders WHERE payment_status = $1 ORDER BY created_at DESC',
      [paymentStatus]
    );
    return rows;
  }
}

module.exports = Order; 