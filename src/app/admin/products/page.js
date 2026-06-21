import { getAdminProducts } from '@/actions/admin-products';
import ProductsClient from '@/components/admin/products-client';

export const metadata = {
  title: 'Products | Admin',
};

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const page = parseInt(params.page) || 1;
  const search = params.search || '';
  const status = params.status || '';

  const { success, products, pagination } = await getAdminProducts({ page, search, status });

  return (
    <ProductsClient
      initialProducts={products || []}
      pagination={pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }}
      initialSearch={search}
      initialStatus={status}
    />
  );
}
