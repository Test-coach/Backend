const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');

const prisma = new PrismaClient();

async function tableExists(tableName) {
  // This works for Postgres. Adjust for other DBs if needed.
  const result = await prisma.$queryRawUnsafe(
    `SELECT to_regclass('public."${tableName}"') as to_regclass`
  );
  return result[0] && result[0].to_regclass !== null;
}

async function ensureMigrations() {
  const requiredTables = ['govtExam']; // Add more table names as needed

  let allExist = true;
  for (const table of requiredTables) {
    const exists = await tableExists(table);
    if (!exists) {
      allExist = false;
      break;
    }
  }

  if (!allExist) {
    console.log('Running migrations...');
    await new Promise((resolve, reject) => {
      exec('npx prisma migrate deploy', (error, stdout, stderr) => {
        if (error) {
          console.error(`Migration error: ${stderr}`);
          reject(error);
        } else {
          console.log(stdout);
          resolve();
        }
      });
    });
  } else {
    console.log('All required tables exist. No migration needed.');
  }
}

module.exports = { ensureMigrations }; 