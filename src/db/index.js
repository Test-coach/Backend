const prisma = require('./prisma');
const { ensureMigrations } = require('./ensureMigrations');
const { resetAndMigrate } = require('./resetAndMigrate');

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Export Prisma client, connection test, ensureMigrations, and resetAndMigrate
module.exports = {
  prisma,
  testConnection,
  ensureMigrations,
  resetAndMigrate
}; 