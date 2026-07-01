const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const variantsData = [{
      productId: 'cmqnxo7720002ubtwrzbyp10j',
      name: 'Pack of 1',
      price: 59,
      originalPrice: 99,
      stock: 60,
      isBestSeller: false,
      sortOrder: 0,
      isActive: true,
      badgeText: 'fires',
      savingsText: 'SAVE FLAT 0',
      keyPoints: ['1 PIECE PREMIUM MICROFIBER', 'No Gift Included'],
      images: []
    }];
    await prisma.productVariant.createMany({ data: variantsData });
    console.log("Success");
  } catch (e) {
    console.error("Error creating variants:", e);
  }
}
main();
