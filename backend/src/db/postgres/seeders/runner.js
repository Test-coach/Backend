const SeederUtil = require('../utils/seeder.util');

class SeederRunner {
  static async run(options = {}) {
    try {
      const { clear = false } = options;

      if (clear) {
        console.log('Clearing existing data...');
        await SeederUtil.clearData();
        console.log('Data cleared successfully');
      }

      console.log('Starting seeding...');

      // Seed users
      console.log('Seeding users...');
      await SeederUtil.seedUsers();
      console.log('Users seeded successfully');

      // Seed coupons
      console.log('Seeding coupons...');
      await SeederUtil.seedCoupons();
      console.log('Coupons seeded successfully');

      console.log('All seeding completed successfully');
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  }
}

// Run seeders if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    clear: args.includes('--clear')
  };
  SeederRunner.run(options);
}

module.exports = SeederRunner; 