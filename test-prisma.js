const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const variants = require('./variants-dump.json');

async function main() {
  const productId = variants[0].productId;
  
  const variantsData = variants.map((v, i) => ({
    productId,
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
  
  console.log("Variants Data:", JSON.stringify(variantsData, null, 2));
  
  try {
    await prisma.productVariant.deleteMany({ where: { productId } });
    const result = await prisma.productVariant.createMany({ data: variantsData });
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
