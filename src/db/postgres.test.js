const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPostgresConnection() {
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('PostgreSQL connection successful');

    // Test database version
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('PostgreSQL version:', version[0].version);

    // Test database name
    const dbName = await prisma.$queryRaw`SELECT current_database()`;
    console.log('Connected to database:', dbName[0].current_database);

    // Test schema
    const schema = await prisma.$queryRaw`SELECT current_schema()`;
    console.log('Current schema:', schema[0].current_schema);

    // Test if we can query the database
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('Available tables:', tables.map(t => t.table_name));

    // Close the connection
    await prisma.$disconnect();
    console.log('PostgreSQL connection closed');

    return true;
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testPostgresConnection()
    .then(success => {
      if (success) {
        console.log('PostgreSQL test completed successfully');
      } else {
        console.error('PostgreSQL test failed');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Error during PostgreSQL test:', err);
      process.exit(1);
    });
}

module.exports = { testPostgresConnection }; 