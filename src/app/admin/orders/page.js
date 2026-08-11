import { getAllOrders } from '@/actions/admin';
import OrdersClient from '@/components/admin/orders-client';

export const metadata = {
  title: 'Manage Orders | Admin',
};

export default async function AdminOrdersPage({ searchParams }) {
  const { page, search, dateFilter, startDate, endDate } = await searchParams;
  const currentPage = parseInt(page) || 1;
  const currentSearch = search || '';
  const currentFilter = dateFilter || '';
  const currentStart = startDate || '';
  const currentEnd = endDate || '';

  const { success, orders, pagination, error } = await getAllOrders(currentPage, 10, currentSearch, currentFilter, currentStart, currentEnd);

  if (!success) {
    return <div className="text-red-500">Failed to load orders: {error}</div>;
  }

  return (
    <OrdersClient initialData={{ orders, pagination, currentSearch, currentFilter, currentStart, currentEnd }} />
  );
}
