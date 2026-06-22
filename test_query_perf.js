const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = '1200-gsm-microfiber-car-cleaning-cloth';
  
  console.log("Testing flat query performance...");
  console.time("getProductBySlugFlat");
  const flat = await prisma.product.findUnique({
    where: { slug },
  });
  console.timeEnd("getProductBySlugFlat");

  console.log("Testing parallel queries performance...");
  console.time("parallelQueries");
  const [product, images, variants, features, specs, reviews, qa, category] = await Promise.all([
    prisma.product.findUnique({ where: { slug } }),
    prisma.productImage.findMany({ where: { product: { slug } }, orderBy: { sortOrder: 'asc' } }),
    prisma.productVariant.findMany({ where: { product: { slug }, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.productFeature.findMany({ where: { product: { slug } }, orderBy: { sortOrder: 'asc' } }),
    prisma.productSpec.findMany({ where: { product: { slug } }, orderBy: { sortOrder: 'asc' } }),
    prisma.productReview.findMany({ where: { product: { slug }, approved: true }, orderBy: { createdAt: 'desc' }, include: { customer: true } }),
    prisma.productQA.findMany({ where: { product: { slug }, status: 'answered' }, orderBy: { createdAt: 'desc' } }),
    flat ? prisma.category.findUnique({ where: { id: flat.categoryId } }) : null
  ]);
  console.timeEnd("parallelQueries");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
