const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const packs = await prisma.productVariant.findMany({
    where: { productId: 'cmqnxo7720002ubtwrzbyp10j' },
    orderBy: { sortOrder: 'asc' }
  });
  console.log(packs);
}
main().catch(console.error);
