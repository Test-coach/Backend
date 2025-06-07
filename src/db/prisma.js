const { PrismaClient } = require('@prisma/client');

// Create a single Prisma client instance
const prisma = new PrismaClient({
  log: ["query"]
});

// Handle connection errors
prisma.$on('error', (e) => {
  console.error('Prisma Client error:', e);
});

// Handle connection events
prisma.$on('query', (e) => {
  console.log('Query:', e.query);
  console.log('Duration:', `${e.duration}ms`);
});

// Handle process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma; 