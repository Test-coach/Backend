const bcrypt = require('bcrypt');
const { connectMongo } = require('./mongo');
const User = require('./schemas/user.schema');
const Course = require('./schemas/course.schema');
const TypingTest = require('./schemas/typing-test.schema');
const Coupon = require('./schemas/coupon.schema');

const seedDatabase = async () => {
  try {
    await connectMongo();

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      TypingTest.deleteMany({}),
      Coupon.deleteMany({})
    ]);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true
    });

    // Create sample courses
    const courses = await Course.create([
      {
        title: 'AIIMS CRE English Typing Skill FREE Test',
        slug: 'aiims-cre-english-typing-free',
        description: 'Practice typing test for AIIMS CRE examination',
        thumbnail: '/images/courses/aiims-cre.png',
        duration: 7,
        price: {
          amount: 0,
          currency: 'INR'
        },
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
        createdBy: admin._id
      },
      {
        title: 'Supreme Court Junior Court Assistant Typing Test',
        slug: 'sc-jca-typing',
        description: 'Complete typing course for Supreme Court JCA exam',
        thumbnail: '/images/courses/sc-jca.png',
        duration: 30,
        price: {
          amount: 999,
          currency: 'INR'
        },
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
        createdBy: admin._id
      }
    ]);

    // Create sample typing tests
    const typingTests = [];
    for (const course of courses) {
      const tests = await TypingTest.create([
        {
          title: `${course.title} - Test 1`,
          course: course._id,
          description: 'Basic typing speed and accuracy test',
          duration: 15,
          difficulty: 'easy',
          passage: {
            content: 'There are many form of communication and sometimes a person\'s body language can actually indicate more things than the spoken word. Learning to understand body language can be very beneficial both in the work environment as well as on a more personal front...',
            wordCount: 150,
            category: 'general'
          },
          requirements: {
            minWPM: 30,
            maxErrors: 10,
            minAccuracy: 90
          },
          createdBy: admin._id
        },
        {
          title: `${course.title} - Test 2`,
          course: course._id,
          description: 'Advanced typing test with complex passages',
          duration: 15,
          difficulty: 'medium',
          passage: {
            content: 'The Supreme Court of India is the highest judicial forum and final court of appeal under the Constitution of India, the highest constitutional court, with the power of judicial review...',
            wordCount: 200,
            category: 'legal'
          },
          requirements: {
            minWPM: 40,
            maxErrors: 8,
            minAccuracy: 95
          },
          createdBy: admin._id
        }
      ]);
      typingTests.push(...tests);
    }

    // Create sample coupons
    await Coupon.create([
      {
        code: 'WELCOME50',
        type: 'percentage',
        value: 50,
        maxDiscount: 500,
        minPurchase: 999,
        description: 'Get 50% off on your first purchase',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        userGroups: ['new'],
        metadata: {
          createdBy: admin._id,
          campaign: 'New User Welcome'
        }
      },
      {
        code: 'FLAT200',
        type: 'fixed',
        value: 200,
        minPurchase: 500,
        description: 'Flat ₹200 off on all courses',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        maxUses: 100,
        userGroups: ['all'],
        metadata: {
          createdBy: admin._id,
          campaign: 'Weekly Special'
        }
      }
    ]);

    console.log('Database seeded successfully! 🌱');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 