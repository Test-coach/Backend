const fs = require('fs').promises;
const path = require('path');
const MigrationUtil = require('../utils/migration.util');

class MigrationRunner {
  static async run() {
    try {
      // Initialize migrations table
      await MigrationUtil.initMigrationTable();

      // Get all migration files
      const migrationsDir = path.join(__dirname);
      const files = await fs.readdir(migrationsDir);
      const migrationFiles = files
        .filter(f => f.endsWith('.sql'))
        .sort();

      // Get executed migrations
      const executedMigrations = await MigrationUtil.getExecutedMigrations();

      // Execute pending migrations
      for (const file of migrationFiles) {
        if (!executedMigrations.includes(file)) {
          console.log(`Executing migration: ${file}`);
          const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
          await MigrationUtil.executeMigration(file, sql);
          console.log(`Completed migration: ${file}`);
        } else {
          console.log(`Skipping already executed migration: ${file}`);
        }
      }

      console.log('All migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  MigrationRunner.run();
}

module.exports = MigrationRunner; 