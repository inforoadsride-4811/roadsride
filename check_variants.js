const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { isFeatured: true, status: 'active' },
    include: {
      variants: { orderBy: { sortOrder: 'asc' }, where: { isActive: true } },
    },
  });
  console.log(JSON.stringify(products, null, 2));
}

main().finally(() => prisma.$disconnect());
