import { redirect } from 'next/navigation';
import { getDashboardStats } from '@/actions/admin';
import { StatCard } from '@/components/ui/stat-card';
import { Badge, getOrderStatusVariant, getPaymentStatusVariant } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { ShoppingBag, DollarSign, Package, CreditCard, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/product';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | RoadsRide',
};

export default async function AdminDashboard() {
  const { success, stats, recentOrders, error } = await getDashboardStats();

  if (!success) {
    return <div className="text-red-500">Error loading dashboard: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-black">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue (Paid)"
          value={formatPrice(stats.revenue)}
          icon={<DollarSign size={24} />}
          trend={12.5}
          trendLabel="vs last month"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBag size={24} />}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<Clock size={24} />}
        />
        <StatCard
          title="Prepaid Orders"
          value={stats.prepaidOrders}
          icon={<CreditCard size={24} />}
        />
      </div>

      <div className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-brand-black">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-brand-yellow hover:text-brand-yellow-hover">
            View All
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-brand-black">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{order.firstName} {order.lastName}</span>
                      <span className="text-xs text-gray-500">{order.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={getOrderStatusVariant(order.orderStatus)} className="capitalize">
                      {order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPaymentStatusVariant(order.paymentStatus)} className="uppercase">
                      {order.paymentMethod === 'cod' ? 'COD' : 'RAZORPAY'} - {order.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
