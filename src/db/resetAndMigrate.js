const { exec } = require('child_process');

async function resetAndMigrate() {
  console.log('Resetting database and running migrations...');
  await new Promise((resolve, reject) => {
    exec('npx prisma migrate reset --force --skip-seed', (error, stdout, stderr) => {
      if (error) {
        console.error(`Reset error: ${stderr}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}

module.exports = { resetAndMigrate }; 