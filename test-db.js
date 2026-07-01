const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: '1200-gsm-microfiber-car-cleaning-cloth' },
    include: { variants: true }
  });
  console.log(JSON.stringify(product.variants, null, 2));
}
main();
