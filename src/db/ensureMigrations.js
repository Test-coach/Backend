const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function ensureMigrations() {
  try {
    // Get all migration directories
    const migrationsDir = path.join(__dirname, '../../prisma/migrations');
    const migrationFolders = fs.readdirSync(migrationsDir).filter(f => !f.startsWith('.'));

    // Get just the migration name part (after the first underscore)
    const migrationNames = migrationFolders.map(folder => folder.split('_').slice(1).join('_'));

    // Get applied migrations from the database
    const appliedMigrations = await prisma.$queryRawUnsafe(
      `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`
    );
    const appliedNames = appliedMigrations.map(m => m.migration_name);

    // If all migration names are in the applied list, skip migrate deploy
    const allApplied = migrationNames.every(name => appliedNames.includes(name));
    if (allApplied) {
      console.log('All migrations already applied. Skipping migrate deploy.');
      return;
    }

    // Otherwise, run migrate deploy
    console.log('Running migrations...');
    await new Promise((resolve, reject) => {
      exec('npx prisma migrate deploy', (error, stdout, stderr) => {
        if (error) {
          console.error(`Migration error: ${stderr}`);
          reject(error);
        } else {
          resolve();
        }
      });
    });
  } catch (err) {
    console.error('Error in ensureMigrations:', err);
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { ensureMigrations }; 