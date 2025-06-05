const MigrationRunner = require('../migrations/runner');
const SeederRunner = require('../seeders/runner');
const IndexRunner = require('../../mongo/indexes/runner');

class DatabaseInitializer {
  static async initialize(options = {}) {
    try {
      console.log('Starting database initialization...');

      // Run PostgreSQL migrations
      console.log('\n=== Running PostgreSQL Migrations ===');
      await MigrationRunner.run();

      // Run PostgreSQL seeders if in development or explicitly requested
      if (process.env.NODE_ENV === 'development' || options.seed) {
        console.log('\n=== Running PostgreSQL Seeders ===');
        await SeederRunner.run({
          clear: options.clearData
        });
      }

      // Verify MongoDB indexes (only create if missing and not skipped)
      if (!options.skipMongoIndexes) {
        console.log('\n=== Verifying MongoDB Indexes ===');
        await IndexRunner.run({
          force: options.forceIndexes,
          skipIndexes: options.skipMongoIndexes
        });
      } else {
        console.log('\n=== Skipping MongoDB Index Creation ===');
      }

      console.log('\nDatabase initialization completed successfully');
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }
}

module.exports = DatabaseInitializer; 