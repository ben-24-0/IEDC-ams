const bcrypt = require('bcrypt');
const prisma = require('./db');

async function seed() {
  const passwordHash = await bcrypt.hash('changeme123', 10);
  const admin = await prisma.adminUser.create({
    data: { username: 'admin', passwordHash },
  });
  console.log('created admin:', admin.username);
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());