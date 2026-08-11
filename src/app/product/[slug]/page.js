import { getProductBySlug, getProducts } from '@/actions/product';
import { notFound } from 'next/navigation';
import ProductPageClient from '@/components/product/product-page-client';

export const revalidate = 60; // Cache the page for 60 seconds (ISR)

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { success, product } = await getProductBySlug(slug);

  if (!success || !product) {
    return { title: 'Product Not Found' };
  }

  const primaryImage = product.ogImage || product.images?.[0]?.src || product.packs?.[0]?.images?.[0]?.src;
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || `Buy ${product.name} at RoadsRide. Premium quality, best prices, and secure delivery.`;

  return {
    title,
    description,
    keywords: product.seoKeywords || '',
    openGraph: {
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
    ...(product.canonicalUrl && { alternates: { canonical: product.canonicalUrl } }),
  };
}

export default async function SlugProductPage({ params }) {
  const { slug } = await params;

  // Run both queries in parallel instead of sequentially
  const [productResult, recsResult] = await Promise.all([
    getProductBySlug(slug),
    getProducts({ limit: 4 }),
  ]);

  if (!productResult.success || !productResult.product) {
    notFound();
  }

  const recommendations = (recsResult.products || [])
    .filter(p => p.id !== productResult.product.id)
    .slice(0, 3);

  return <ProductPageClient product={productResult.product} recommendations={recommendations} />;
}
