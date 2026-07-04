const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const variants = require('./variants-dump.json');
async function main() {
  try {
    const variantsData = variants.map((v, i) => ({
        productId: v.productId,
        name: v.name,
        price: parseFloat(v.price),
        originalPrice: parseFloat(v.originalPrice || v.price),
        stock: parseInt(v.stock) || 0,
        isBestSeller: v.isBestSeller || false,
        sortOrder: i,
        isActive: v.isActive !== false,
        images: v.images || null,
        badgeText: v.badgeText || null,
        savingsText: v.savingsText || null,
        keyPoints: v.keyPoints ? v.keyPoints.filter(Boolean) : null,
      }));
    await prisma.productVariant.createMany({ data: variantsData });
    console.log("Success");
  } catch(e) {
    console.error("ERROR:");
    console.error(e);
  }
}
main().finally(() => prisma.$disconnect());
