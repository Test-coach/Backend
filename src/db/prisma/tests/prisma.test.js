const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testPrismaImplementation() {
  try {
    console.log('Starting Prisma implementation tests...\n');

    // Test 1: Database Connection
    console.log('Test 1: Database Connection');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Test 2: User Creation and Authentication
    console.log('Test 2: User Operations');
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password_hash: await bcrypt.hash('testpass123', 10),
        role: 'user',
        is_active: true,
        is_verified: true,
        preferences: {
          create: {
            theme: 'light',
            email_notifications: true
          }
        },
        profile: {
          create: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      },
      include: {
        preferences: true,
        profile: true
      }
    });
    console.log('✅ User created successfully');
    console.log('User data:', {
      id: testUser.id,
      email: testUser.email,
      username: testUser.username,
      preferences: testUser.preferences,
      profile: testUser.profile
    }, '\n');

    // Test 3: Coupon Creation and Validation
    console.log('Test 3: Coupon Operations');
    const testCoupon = await prisma.coupon.create({
      data: {
        code: 'TEST20',
        type: 'percentage',
        value: 20,
        max_discount: 100,
        min_purchase: 50,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        max_uses: 100,
        max_uses_per_user: 1,
        is_active: true
      }
    });
    console.log('✅ Coupon created successfully');
    console.log('Coupon data:', testCoupon, '\n');

    // Test 4: Order Creation
    console.log('Test 4: Order Operations');
    const testOrder = await prisma.order.create({
      data: {
        user_id: testUser.id,
        status: 'pending',
        total_amount: 150,
        items: [
          {
            product_id: 'test_prod_1',
            quantity: 2,
            price: 75
          }
        ],
        shipping_address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          country: 'Test Country'
        },
        payment_method: 'credit_card',
        payment_status: 'pending'
      }
    });
    console.log('✅ Order created successfully');
    console.log('Order data:', testOrder, '\n');

    // Test 5: Complex Queries
    console.log('Test 5: Complex Queries');
    const userWithOrders = await prisma.user.findUnique({
      where: { id: testUser.id },
      include: {
        orders: true,
        preferences: true,
        profile: true
      }
    });
    console.log('✅ Complex query successful');
    console.log('User with orders:', {
      id: userWithOrders.id,
      email: userWithOrders.email,
      orderCount: userWithOrders.orders.length,
      preferences: userWithOrders.preferences,
      profile: userWithOrders.profile
    }, '\n');

    // Test 6: Transaction
    console.log('Test 6: Transaction');
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: testOrder.id },
        data: { status: 'processing' }
      });

      // Create order history
      const orderHistory = await tx.orderHistory.create({
        data: {
          order_id: testOrder.id,
          status: 'processing',
          notes: 'Order processing started'
        }
      });

      return { updatedOrder, orderHistory };
    });
    console.log('✅ Transaction successful');
    console.log('Transaction result:', transactionResult, '\n');

    // Test 7: Cleanup
    console.log('Test 7: Cleanup');
    await prisma.$transaction([
      prisma.orderHistory.deleteMany({
        where: { order_id: testOrder.id }
      }),
      prisma.order.delete({
        where: { id: testOrder.id }
      }),
      prisma.coupon.delete({
        where: { id: testCoupon.id }
      }),
      prisma.user.delete({
        where: { id: testUser.id }
      })
    ]);
    console.log('✅ Cleanup successful\n');

    console.log('All tests completed successfully! 🎉');
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPrismaImplementation()
    .catch((error) => {
      console.error('Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testPrismaImplementation }; 