const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { id: 'cmqnxo7720002ubtwrzbyp10j' },
    include: { variants: true }
  });
  console.log('ID match:', product ? product.slug : 'not found');
  console.log(JSON.stringify(product?.variants, null, 2));
}
main();
