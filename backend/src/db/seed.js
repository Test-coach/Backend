const bcrypt = require('bcrypt');
const { prisma } = require('./index');
const { Decimal } = require('@prisma/client/runtime/library');

const seedDatabase = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    
    // Clear all tables
    await prisma.$transaction([
      prisma.couponUsage.deleteMany(),
      prisma.coupon.deleteMany(),
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.courseEnrollment.deleteMany(),
      prisma.course.deleteMany(),
      prisma.userPreference.deleteMany(),
      prisma.userProfile.deleteMany(),
      prisma.user.deleteMany()
    ]);

    // Create admin user only if environment variables are set
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      
      const admin = await prisma.user.create({
        data: {
          username: process.env.ADMIN_USERNAME || 'admin',
          email: process.env.ADMIN_EMAIL,
          password: hashedPassword,
          role: 'admin',
          profile: {
            create: {
              firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
              lastName: process.env.ADMIN_LAST_NAME || 'User',
              bio: process.env.ADMIN_BIO || 'System Administrator',
              phoneNumber: process.env.ADMIN_PHONE
            }
          }
        }
      });

      // Create sample courses
      console.log('Creating sample courses...');
      const courses = await Promise.all([
        prisma.course.create({
          data: {
            title: 'AIIMS CRE English Typing Skill FREE Test',
            slug: 'aiims-cre-english-typing-free',
            description: 'Practice typing test for AIIMS CRE examination',
            thumbnail: '/images/courses/aiims-cre.png',
            duration: 7,
            price: new Decimal(0),
            features: [
              '3 FREE Tests',
              'Real User Interface',
              'Free Speed Booster Course',
              'Based on Previous Year'
            ],
            category: 'government',
            level: 'intermediate',
            isPublished: true,
            isFeatured: true,
            createdBy: admin.id
          }
        }),
        prisma.course.create({
          data: {
            title: 'Supreme Court Junior Court Assistant Typing Test',
            slug: 'sc-jca-typing',
            description: 'Complete typing course for Supreme Court JCA exam',
            thumbnail: '/images/courses/sc-jca.png',
            duration: 30,
            price: new Decimal(999),
            features: [
              '50+ Tests',
              'Real User Interface',
              'Legal Content Available',
              'Based on Previous Year',
              'Custom Made Tests'
            ],
            category: 'government',
            level: 'advanced',
            isPublished: true,
            createdBy: admin.id
          }
        })
      ]);

      // Create sample coupons
      console.log('Creating sample coupons...');
      await Promise.all([
        prisma.coupon.create({
          data: {
            code: 'WELCOME50',
            type: 'percentage',
            value: new Decimal(50),
            maxDiscount: new Decimal(500),
            minPurchase: new Decimal(999),
            description: 'Get 50% off on your first purchase',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            maxUses: 1000,
            createdBy: admin.id
          }
        }),
        prisma.coupon.create({
          data: {
            code: 'FLAT200',
            type: 'fixed',
            value: new Decimal(200),
            minPurchase: new Decimal(500),
            description: 'Flat ₹200 off on all courses',
            startDate: new Date(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            maxUses: 100,
            createdBy: admin.id
          }
        })
      ]);
    } else {
      console.log('Skipping admin user creation - ADMIN_EMAIL and ADMIN_PASSWORD not set');
    }

    console.log('Database seeded successfully! 🌱');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDatabase(); 