const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const packs = await prisma.productVariant.findMany({
    where: { productId: 'cmqnxo7720002ubtwrzbyp10j' },
  });
  console.log(JSON.stringify(packs, null, 2));
}
main().catch(console.error);
