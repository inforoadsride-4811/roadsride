const { revalidateTag } = require('next/cache');
async function run() {
  revalidateTag('product');
  console.log('Busted cache!');
}
run();
