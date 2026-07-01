const { saveProductVariants } = require('./src/actions/admin-products');
async function run() {
  const res = await saveProductVariants('cmqnxo7720002ubtwrzbyp10j', [
    {
      name: 'Pack of 1',
      price: 59,
      originalPrice: 99,
      stock: 60,
      isBestSeller: false,
      badgeText: 'fires',
      savingsText: 'SAVE FLAT 0',
      keyPoints: ['1 PIECE PREMIUM MICROFIBER', 'No Gift Included'],
      images: []
    }
  ]);
  console.log(res);
}
run();
