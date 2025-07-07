const { exec } = require('child_process');

async function ensureMigrations() {
  console.log('Running migrations (idempotent) ...');
  await new Promise((resolve, reject) => {
    exec('npx prisma migrate deploy', { env: process.env }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${stderr}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}

module.exports = { ensureMigrations }; 