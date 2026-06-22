const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'princekhan80550@gmail.com';
  console.log(`Looking for customer with email: ${email}`);

  const customer = await prisma.customer.findUnique({
    where: { email },
  });

  if (!customer) {
    console.error(`Customer not found with email: ${email}`);
    return;
  }

  console.log(`Found customer: ${customer.name} (authId: ${customer.authId})`);

  const admin = await prisma.adminUser.upsert({
    where: { authId: customer.authId },
    update: {
      role: 'admin',
      active: true,
    },
    create: {
      authId: customer.authId,
      email: customer.email,
      name: customer.name,
      role: 'admin',
      active: true,
    },
  });

  console.log(`Successfully created/updated AdminUser!`);
  console.log(admin);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
