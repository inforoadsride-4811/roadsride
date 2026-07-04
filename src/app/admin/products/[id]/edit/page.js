import { notFound } from 'next/navigation';
import ProductForm from '@/components/admin/product-form';
import { getAdminProduct, getAdminCategories } from '@/actions/admin-products';

export const metadata = {
  title: 'Edit Product | Admin',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditProductPage({ params }) {
  const { id } = await params;
  
  const [productRes, categoriesRes] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
  ]);

  if (!productRes.success || !productRes.product) {
    notFound();
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <ProductForm initialData={productRes.product} categories={categoriesRes.categories || []} />
      </div>
    </div>
  );
}
