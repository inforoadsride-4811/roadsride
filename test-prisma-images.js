const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const p = await prisma.product.findFirst();
  await prisma.productVariant.deleteMany({ where: { productId: p.id } });
  
  const variantsData = [
    {
      productId: p.id,
      name: 'Test',
      price: 100,
      originalPrice: 100,
      stock: 10,
      images: [{ id: 'test', src: 'test.png', alt: 'Test' }]
    }
  ];
  
  await prisma.productVariant.createMany({ data: variantsData });
  
  const saved = await prisma.productVariant.findMany({ where: { productId: p.id } });
  console.log("Saved variant images:", saved[0].images);
}
run();
