import { getProductBySlug } from '@/actions/product';
import { notFound } from 'next/navigation';
import ProductPageClient from '@/components/product/product-page-client';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { success, product } = await getProductBySlug(slug);

  if (!success || !product) {
    return { title: 'Product Not Found | RoadsRide' };
  }

  return {
    title: product.seoTitle || `${product.shortName} | RoadsRide`,
    description: product.seoDescription || '',
    keywords: product.seoKeywords || '',
    openGraph: {
      title: product.seoTitle || product.name,
      description: product.seoDescription || '',
      images: product.ogImage ? [product.ogImage] : product.packs?.[0]?.images?.[0]?.src ? [product.packs[0].images[0].src] : [],
    },
    ...(product.canonicalUrl && { alternates: { canonical: product.canonicalUrl } }),
  };
}

export default async function SlugProductPage({ params }) {
  const { slug } = await params;
  const { success, product } = await getProductBySlug(slug);

  if (!success || !product) {
    notFound();
  }

  return <ProductPageClient product={product} />;
}
