import { getAdminCategories } from '@/actions/admin-products';
import CategoriesClient from '@/components/admin/categories-client';

export const metadata = {
  title: 'Categories | Admin',
};

export default async function AdminCategoriesPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams?.page) || 1;
  const search = resolvedParams?.search || '';

  const { success, categories, error } = await getAdminCategories();

  if (!success) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-black">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your product collections</p>
        </div>
      </div>
      
      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
