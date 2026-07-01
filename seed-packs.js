const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const productId = 'cmqnxo7720002ubtwrzbyp10j';
  
  await prisma.productVariant.deleteMany({ where: { productId } });

  const variantsData = [
    {
      productId,
      name: 'Pack of 1 (Standard Pack)',
      price: 599,
      originalPrice: 599,
      stock: 100,
      isBestSeller: false,
      sortOrder: 0,
      isActive: true,
      badgeText: '',
      savingsText: 'Save Flat ₹0',
      keyPoints: ['1 Piece Premium Microfiber (1200 GSM)', '❌ No Gift Included'],
      images: []
    },
    {
      productId,
      name: 'Pack of 2 (Value Bundle)',
      price: 949,
      originalPrice: 1198, // 599 * 2
      stock: 100,
      isBestSeller: true,
      sortOrder: 1,
      isActive: true,
      badgeText: '🔥 MOST POPULAR | FLAT ₹249 SAVINGS',
      savingsText: '',
      keyPoints: ['2 Pieces Premium Microfiber (1200 GSM)', '🎁 FREE GIFT: 1x Car Blind Spot Mirror'],
      images: []
    },
    {
      productId,
      name: 'Pack of 3 (Super Saver)',
      price: 1249,
      originalPrice: 1797, // 599 * 3
      stock: 100,
      isBestSeller: false,
      sortOrder: 2,
      isActive: true,
      badgeText: '⭐ BEST VALUE | ₹548 BIG SAVINGS',
      savingsText: '',
      keyPoints: ['3 Pieces Premium Microfiber (1200 GSM)', '🎁 FREE GIFT 1: 1x Car Blind Spot Mirror', '🔥 FREE GIFT 2: 1x Extra 500 GSM Cloth'],
      images: []
    },
    {
      productId,
      name: 'Pack of 4 (Mega Bundle)',
      price: 1549,
      originalPrice: 2396, // 599 * 4
      stock: 100,
      isBestSeller: false,
      sortOrder: 3,
      isActive: true,
      badgeText: '🚀 MAX SAVINGS | ₹847 HUGE SAVINGS',
      savingsText: '',
      keyPoints: ['4 Pieces Premium Microfiber (1200 GSM)', '🎁 FREE GIFT 1: 1x Car Blind Spot Mirror', '🔥 FREE GIFT 2: 2x Extra 500 GSM Cloths'],
      images: []
    }
  ];

  await prisma.productVariant.createMany({ data: variantsData });
  console.log("Seeded 4 packs successfully!");
}
main().catch(console.error);
