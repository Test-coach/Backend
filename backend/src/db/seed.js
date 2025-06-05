const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const { postgresConfig, mongoConfig } = require('../../config/database.config');
const { Pool } = require('pg');
const User = require('./postgres/models/user.model');
const Course = require('./postgres/models/course.model');
const Coupon = require('./postgres/models/coupon.model');

const seedDatabase = async () => {
  const pgPool = new Pool(postgresConfig);
  const mongoClient = new MongoClient(mongoConfig.uri);
  
  try {
    // Connect to both databases
    await mongoClient.connect();
    const mongoDb = mongoClient.db(process.env.MONGO_DB || 'typing_analytics');
    
    // Clear existing data
    console.log('Clearing existing data...');
    
    // Clear PostgreSQL data
    await pgPool.query(`
      TRUNCATE users, user_profiles, user_preferences, 
              courses, course_enrollments, 
              orders, order_items,
              coupons, coupon_usage CASCADE;
    `);
    
    // Clear MongoDB collections
    await Promise.all([
      mongoDb.collection('user_activity').deleteMany({}),
      mongoDb.collection('test_passages').deleteMany({}),
      mongoDb.collection('keystrokes').deleteMany({})
    ]);

    // Create admin user only if environment variables are set
    if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
      console.log('Creating admin user...');
      const admin = await User.create({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });

      // Create user profile for admin
      await User.updateProfile(admin.id, {
        firstName: process.env.ADMIN_FIRST_NAME || 'Admin',
        lastName: process.env.ADMIN_LAST_NAME || 'User',
        bio: process.env.ADMIN_BIO || 'System Administrator',
        phoneNumber: process.env.ADMIN_PHONE
      });

      // Create sample courses
      console.log('Creating sample courses...');
      const courses = await Promise.all([
        Course.create({
          title: 'AIIMS CRE English Typing Skill FREE Test',
          slug: 'aiims-cre-english-typing-free',
          description: 'Practice typing test for AIIMS CRE examination',
          thumbnail: '/images/courses/aiims-cre.png',
          duration: 7,
          price: 0,
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
        }),
        Course.create({
          title: 'Supreme Court Junior Court Assistant Typing Test',
          slug: 'sc-jca-typing',
          description: 'Complete typing course for Supreme Court JCA exam',
          thumbnail: '/images/courses/sc-jca.png',
          duration: 30,
          price: 999,
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
        })
      ]);

      // Create sample test passages in MongoDB
      console.log('Creating sample test passages...');
      const testPassages = await mongoDb.collection('test_passages').insertMany([
        {
          courseId: courses[0].id,
          title: 'AIIMS CRE - Test 1',
          content: 'There are many form of communication and sometimes a person\'s body language can actually indicate more things than the spoken word. Learning to understand body language can be very beneficial both in the work environment as well as on a more personal front...',
          wordCount: 150,
          category: 'general',
          difficulty: 'easy',
          requirements: {
            minWPM: 30,
            maxErrors: 10,
            minAccuracy: 90
          },
          createdBy: admin.id,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          courseId: courses[1].id,
          title: 'SC JCA - Test 1',
          content: 'The Supreme Court of India is the highest judicial forum and final court of appeal under the Constitution of India, the highest constitutional court, with the power of judicial review...',
          wordCount: 200,
          category: 'legal',
          difficulty: 'medium',
          requirements: {
            minWPM: 40,
            maxErrors: 8,
            minAccuracy: 95
          },
          createdBy: admin.id,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      // Create sample coupons
      console.log('Creating sample coupons...');
      await Promise.all([
        Coupon.create({
          code: 'WELCOME50',
          type: 'percentage',
          value: 50,
          maxDiscount: 500,
          minPurchase: 999,
          description: 'Get 50% off on your first purchase',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          maxUses: 1000,
          createdBy: admin.id
        }),
        Coupon.create({
          code: 'FLAT200',
          type: 'fixed',
          value: 200,
          minPurchase: 500,
          description: 'Flat ₹200 off on all courses',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          maxUses: 100,
          createdBy: admin.id
        })
      ]);

      // Create sample user activity data
      console.log('Creating sample user activity data...');
      await mongoDb.collection('user_activity').insertOne({
        userId: admin.id,
        type: 'test_completion',
        testId: testPassages.insertedIds[0],
        metrics: {
          wpm: 45,
          accuracy: 95,
          errors: 5,
          timeTaken: 300
        },
        createdAt: new Date()
      });
    } else {
      console.log('Skipping admin user creation - ADMIN_EMAIL and ADMIN_PASSWORD not set');
    }

    console.log('Database seeded successfully! 🌱');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await pgPool.end();
    await mongoClient.close();
  }
};

seedDatabase(); 