const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class Order {
  static async create({ 
    userId, 
    courseId, 
    amount, 
    currency = 'INR', 
    paymentMethod, 
    couponId = null, 
    discountAmount = 0,
    notes = null,
    metadata = null
  }) {
    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber();
      
      // Calculate access expiry (1 year from now)
      const accessExpiry = this.calculateAccessExpiry();

      const order = await prisma.order.create({
        data: {
          user_id: userId,
          course_id: courseId,
          amount,
          original_amount: amount,
          currency,
          payment_method: paymentMethod,
          coupon_id: couponId,
          discount_amount: discountAmount,
          status: 'pending',
          order_number: orderNumber,
          access_expiry: accessExpiry,
          notes,
          metadata,
          payment_status: 'initiated',
          payment_gateway: paymentMethod
        },
        include: {
          user: true,
          coupon: true
        }
      });

      return order;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        coupon: true
      }
    });
  }

  static async findByUserId(userId) {
    return prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        coupon: true
      }
    });
  }

  static async findByOrderNumber(orderNumber) {
    return prisma.order.findUnique({
      where: { order_number: orderNumber },
      include: {
        user: true,
        coupon: true
      }
    });
  }

  static async updateStatus(id, status) {
    return prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  static async updatePaymentStatus(id, paymentStatus, paymentDetails = {}) {
    return prisma.order.update({
      where: { id },
      data: {
        payment_status: paymentStatus,
        payment_details: paymentDetails,
        payment_paid_at: paymentStatus === 'success' ? new Date() : null
      }
    });
  }

  static async getOrdersByDateRange(startDate, endDate) {
    return prisma.order.findMany({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { created_at: 'desc' },
      include: {
        user: true,
        coupon: true
      }
    });
  }

  static async getOrdersByStatus(status) {
    return prisma.order.findMany({
      where: { status },
      orderBy: { created_at: 'desc' },
      include: {
        user: true,
        coupon: true
      }
    });
  }

  static async getOrdersByPaymentStatus(paymentStatus) {
    return prisma.order.findMany({
      where: { payment_status: paymentStatus },
      orderBy: { created_at: 'desc' },
      include: {
        user: true,
        coupon: true
      }
    });
  }

  // Helper methods
  static generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }

  static calculateAccessExpiry() {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // 1 year access
    return date;
  }
}

module.exports = Order; 