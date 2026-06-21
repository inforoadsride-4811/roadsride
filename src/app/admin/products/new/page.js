import ProductForm from '@/components/admin/product-form';
import { getAdminCategories } from '@/actions/admin-products';

export const metadata = {
  title: 'Create Product | Admin',
};

export default async function NewProductPage() {
  const { categories } = await getAdminCategories();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <ProductForm categories={categories || []} />
      </div>
    </div>
  );
}
