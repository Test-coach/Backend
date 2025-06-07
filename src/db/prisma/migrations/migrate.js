const { execSync } = require('child_process');
const path = require('path');
const prisma = require('../../prisma');

async function runMigrations() {
  try {
    // Run Prisma migrations
    const prismaPath = path.join(__dirname, '../../../../node_modules/.bin/prisma');
    execSync(`${prismaPath} migrate deploy`, { stdio: 'inherit' });
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { runMigrations }; 