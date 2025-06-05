const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const path = require('path');

const prisma = new PrismaClient();

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Run Prisma migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '../../..')
    });

    // Seed the database if needed
    if (process.env.SEED_DATABASE === 'true') {
      console.log('Seeding database...');
      execSync('npx prisma db seed', {
        stdio: 'inherit',
        cwd: path.join(__dirname, '../../..')
      });
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations }; 