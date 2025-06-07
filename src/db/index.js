const prisma = require('./prisma');

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

// Export Prisma client and connection test
module.exports = {
  prisma,
  testConnection
}; 