const prisma = require('../../prisma');

class Coupon {
  static async create({ 
    code, 
    type, 
    value, 
    maxDiscount, 
    minPurchase, 
    startDate, 
    endDate, 
    maxUses, 
    maxUsesPerUser 
  }) {
    try {
      const coupon = await prisma.coupon.create({
        data: {
          code,
          type,
          value,
          max_discount: maxDiscount,
          min_purchase: minPurchase,
          start_date: startDate,
          end_date: endDate,
          max_uses: maxUses,
          max_uses_per_user: maxUsesPerUser,
          is_active: true
        }
      });
      return coupon;
    } catch (error) {
      throw error;
    }
  }

  static async findByCode(code) {
    return prisma.coupon.findFirst({
      where: {
        code,
        is_active: true
      }
    });
  }

  static async validateAndApply(code, userId, amount) {
    try {
      // Find coupon with usage count
      const coupon = await prisma.coupon.findFirst({
        where: {
          code,
          is_active: true
        },
        include: {
          couponUsages: {
            where: {
              user_id: userId
            }
          }
        }
      });

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
      if (coupon.max_uses_per_user && coupon.couponUsages.length >= coupon.max_uses_per_user) {
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

      // Record usage in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update usage count
        const updatedCoupon = await tx.coupon.update({
          where: { id: coupon.id },
          data: {
            uses_count: {
              increment: 1
            }
          }
        });

        // Record usage
        await tx.couponUsage.create({
          data: {
            coupon_id: coupon.id,
            user_id: userId
          }
        });

        return {
          coupon: updatedCoupon,
          discount
        };
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  static async getActiveCoupons() {
    return prisma.coupon.findMany({
      where: {
        is_active: true,
        end_date: {
          gt: new Date()
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  static async getCouponUsage(couponId) {
    return prisma.couponUsage.findMany({
      where: {
        coupon_id: couponId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: {
        used_at: 'desc'
      }
    });
  }

  static async deactivateCoupon(couponId) {
    return prisma.coupon.update({
      where: { id: couponId },
      data: {
        is_active: false
      }
    });
  }

  static async updateCoupon(couponId, updateData) {
    return prisma.coupon.update({
      where: { id: couponId },
      data: updateData
    });
  }
}

module.exports = Coupon; 