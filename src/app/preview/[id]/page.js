import { notFound } from 'next/navigation';
import { getAdminProduct } from '@/actions/admin-products';
import ProductPageClient from '@/components/product/product-page-client';
import { getSessionAdmin } from '@/actions/auth';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { product } = await getAdminProduct(id);
  
  if (!product) return { title: 'Not Found' };
  
  return {
    title: `[PREVIEW] ${product.name}`,
    robots: { index: false, follow: false },
  };
}

export default async function ProductPreviewPage({ params }) {
  // 1. Verify admin session
  const { success: adminSuccess } = await getSessionAdmin();
  if (!adminSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be logged in as an admin to view previews.</p>
        </div>
      </div>
    );
  }

  // 2. Fetch product by ID bypassing status filters
  const { id } = await params;
  const { success, product } = await getAdminProduct(id);

  if (!success || !product) {
    notFound();
  }

  // 3. Render exact same client component as storefront
  return (
    <>
      <div className="bg-red-600 text-white text-center text-sm py-1 font-bold tracking-widest uppercase sticky top-0 z-50 shadow-md">
        Admin Preview Mode - {product.status === 'active' ? 'Published' : 'Draft'}
      </div>
      <ProductPageClient product={product} />
    </>
  );
}
