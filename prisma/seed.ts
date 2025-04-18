import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database...');
  // Add your seed logic here
  const roles = ['GOD_MODE', 'ADMIN', 'USER'];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role },
      update: {},
      create: { name: role },
    });
    console.log(`Created role: ${role}`);
  }

  const adminUserEmail = 'admin@example.com'; // Replace with your desired admin email
  const adminUserName = 'Admin'; // Replace with your desired admin name

  await prisma.user.upsert({
    where: { email: adminUserEmail },
    update: {},
    create: {
      email: adminUserEmail,
      name: adminUserName,
      role: {
        connect: { name: 'GOD_MODE' },
      },
    },
  });

  console.log('Created admin user');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });