const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const exam = await prisma.govtExam.create({
    data: {
      name: 'Minimal Test Exam',
      slug: 'minimal-testt-exam',
      examType: 'OTHER',
      price: 100,
    }
  });
  console.log('Created exam:', exam);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 