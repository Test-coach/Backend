const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { Decimal } = require('@prisma/client/runtime/library');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Starting database seeding...');

    // Create roles
    const adminRole = await prisma.userRole.upsert({
      where: { name: 'admin' },
      update: {
        description: 'Administrator role',
        permissions: { all: true }
      },
      create: {
        name: 'admin',
        description: 'Administrator role',
        permissions: { all: true }
      }
    });

    const userRole = await prisma.userRole.upsert({
      where: { name: 'user' },
      update: {
        description: 'Regular user role',
        permissions: {
          orders: {
            create: true,
            read: true,
            update: true
          },
          coupons: {
            read: true
          }
        }
      },
      create: {
        name: 'user',
        description: 'Regular user role',
        permissions: {
          orders: {
            create: true,
            read: true,
            update: true
          },
          coupons: {
            read: true
          }
        }
      }
    });

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: {
        email: 'admin@example.com'
      },
      update: {
        password_hash: adminPassword,
        role: 'admin',
        is_active: true,
        is_verified: true
      },
      create: {
        email: 'admin@example.com',
        username: 'admin',
        password_hash: adminPassword,
        role: 'admin',
        is_active: true,
        is_verified: true,
        preferences: {
          create: {
            theme: 'dark',
            email_notifications: true,
            push_notifications: true,
            privacy_settings: {
              profile_visibility: 'public',
              show_email: false
            }
          }
        },
        profile: {
          create: {
            first_name: 'Admin',
            last_name: 'User',
            bio: 'System Administrator'
          }
        }
      }
    });

    // Update admin preferences if they exist
    const adminPreferences = await prisma.userPreference.findFirst({
      where: { user_id: admin.id }
    });

    if (adminPreferences) {
      await prisma.userPreference.update({
        where: { id: adminPreferences.id },
        data: {
          theme: 'dark',
          email_notifications: true,
          push_notifications: true,
          privacy_settings: {
            profile_visibility: 'public',
            show_email: false
          }
        }
      });
    }

    // Update admin profile if it exists
    const adminProfile = await prisma.userProfile.findFirst({
      where: { user_id: admin.id }
    });

    if (adminProfile) {
      await prisma.userProfile.update({
        where: { id: adminProfile.id },
        data: {
          first_name: 'Admin',
          last_name: 'User',
          bio: 'System Administrator'
        }
      });
    }

    // Create test user
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await prisma.user.upsert({
      where: {
        email: 'user@example.com'
      },
      update: {
        password_hash: userPassword,
        role: 'user',
        is_active: true,
        is_verified: true
      },
      create: {
        email: 'user@example.com',
        username: 'testuser',
        password_hash: userPassword,
        role: 'user',
        is_active: true,
        is_verified: true,
        preferences: {
          create: {
            theme: 'light',
            email_notifications: true,
            push_notifications: false,
            privacy_settings: {
              profile_visibility: 'private',
              show_email: false
            }
          }
        },
        profile: {
          create: {
            first_name: 'Test',
            last_name: 'User',
            bio: 'Regular user account'
          }
        }
      }
    });

    // Update user preferences if they exist
    const userPreferences = await prisma.userPreference.findFirst({
      where: { user_id: user.id }
    });

    if (userPreferences) {
      await prisma.userPreference.update({
        where: { id: userPreferences.id },
        data: {
          theme: 'light',
          email_notifications: true,
          push_notifications: false,
          privacy_settings: {
            profile_visibility: 'private',
            show_email: false
          }
        }
      });
    }

    // Update user profile if it exists
    const userProfile = await prisma.userProfile.findFirst({
      where: { user_id: user.id }
    });

    if (userProfile) {
      await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: {
          first_name: 'Test',
          last_name: 'User',
          bio: 'Regular user account'
        }
      });
    }

    // Create sample coupons
    const coupons = await Promise.all([
      prisma.coupon.upsert({
        where: {
          code: 'WELCOME10'
        },
        update: {
          type: 'percentage',
          value: new Decimal(10),
          max_discount: new Decimal(100),
          min_purchase: new Decimal(50),
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          max_uses: 100,
          max_uses_per_user: 1,
          is_active: true
        },
        create: {
          code: 'WELCOME10',
          type: 'percentage',
          value: new Decimal(10),
          max_discount: new Decimal(100),
          min_purchase: new Decimal(50),
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          max_uses: 100,
          max_uses_per_user: 1,
          is_active: true
        }
      }),
      prisma.coupon.upsert({
        where: {
          code: 'FLAT20'
        },
        update: {
          type: 'fixed',
          value: new Decimal(20),
          max_discount: new Decimal(20),
          min_purchase: new Decimal(100),
          start_date: new Date(),
          end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
          max_uses: 50,
          max_uses_per_user: 1,
          is_active: true
        },
        create: {
          code: 'FLAT20',
          type: 'fixed',
          value: new Decimal(20),
          max_discount: new Decimal(20),
          min_purchase: new Decimal(100),
          start_date: new Date(),
          end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
          max_uses: 50,
          max_uses_per_user: 1,
          is_active: true
        }
      })
    ]);

    // Create sample orders
    const orders = await Promise.all([
      prisma.order.upsert({
        where: {
          order_number: 'ORD-001'
        },
        update: {
          user: {
            connect: {
              id: user.id
            }
          },
          course_id: 'course_1',
          status: 'pending',
          amount: new Decimal(150),
          original_amount: new Decimal(150),
          payment_method: 'credit_card',
          payment_status: 'pending',
          currency: 'INR',
          metadata: {
            items: [
              {
                product_id: 'prod_1',
                quantity: 2,
                price: 75
              }
            ],
            shipping_address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA'
            }
          }
        },
        create: {
          user: {
            connect: {
              id: user.id
            }
          },
          course_id: 'course_1',
          status: 'pending',
          amount: new Decimal(150),
          original_amount: new Decimal(150),
          payment_method: 'credit_card',
          payment_status: 'pending',
          currency: 'INR',
          order_number: 'ORD-001',
          metadata: {
            items: [
              {
                product_id: 'prod_1',
                quantity: 2,
                price: 75
              }
            ],
            shipping_address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA'
            }
          }
        }
      }),
      prisma.order.upsert({
        where: {
          order_number: 'ORD-002'
        },
        update: {
          user: {
            connect: {
              id: user.id
            }
          },
          course_id: 'course_2',
          status: 'completed',
          amount: new Decimal(200),
          original_amount: new Decimal(200),
          payment_method: 'credit_card',
          payment_status: 'paid',
          currency: 'INR',
          metadata: {
            items: [
              {
                product_id: 'prod_2',
                quantity: 1,
                price: 200
              }
            ],
            shipping_address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA'
            }
          }
        },
        create: {
          user: {
            connect: {
              id: user.id
            }
          },
          course_id: 'course_2',
          status: 'completed',
          amount: new Decimal(200),
          original_amount: new Decimal(200),
          payment_method: 'credit_card',
          payment_status: 'paid',
          currency: 'INR',
          order_number: 'ORD-002',
          metadata: {
            items: [
              {
                product_id: 'prod_2',
                quantity: 1,
                price: 200
              }
            ],
            shipping_address: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA'
            }
          }
        }
      })
    ]);

    console.log('Database seeded successfully!');
    console.log('Created:');
    console.log('- 2 roles (admin, user)');
    console.log('- 2 users (admin, test user)');
    console.log('- 2 coupons');
    console.log('- 2 orders');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seed }; 