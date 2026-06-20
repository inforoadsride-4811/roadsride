import ProductPage from '@/app/page';

export default function SlugProductPage() {
  // We reuse the exact same product page component as requested.
  // Both routes `/` and `/product/[slug]` render the exact same product page.
  return <ProductPage />;
}
