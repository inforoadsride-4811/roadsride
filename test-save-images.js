const { saveProductVariants } = require('./src/actions/admin-products');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const variants = [
    {
      name: 'Test Pack',
      price: 100,
      originalPrice: 100,
      stock: 10,
      images: [{ id: 'test', src: 'test.png', alt: 'Test' }]
    }
  ];
  
  const res = await saveProductVariants('cmqnxo7720002ubtwrzbyp10j', variants);
  console.log("Save result:", res);
  
  const saved = await prisma.productVariant.findMany({ where: { productId: 'cmqnxo7720002ubtwrzbyp10j' } });
  console.log("Saved variant images:", saved[0].images);
}
run();
