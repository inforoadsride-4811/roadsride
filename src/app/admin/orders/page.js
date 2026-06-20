import { getAllOrders } from '@/actions/admin';
import OrdersClient from '@/components/admin/orders-client';

export const metadata = {
  title: 'Manage Orders | Admin',
};

export default async function AdminOrdersPage({ searchParams }) {
  const { page, search } = await searchParams;
  const currentPage = parseInt(page) || 1;
  const currentSearch = search || '';

  const { success, orders, pagination, error } = await getAllOrders(currentPage, 10, currentSearch);

  if (!success) {
    return <div className="text-red-500">Failed to load orders: {error}</div>;
  }

  return (
    <OrdersClient initialData={{ orders, pagination }} />
  );
}
