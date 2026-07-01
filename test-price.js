const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: '1200-gsm-microfiber-car-cleaning-cloth' },
  });
  console.log('Base price:', product?.price);
}
main();
