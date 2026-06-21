import { getDashboardStats } from '@/actions/admin';
import { StatCard } from '@/components/ui/stat-card';
import { Badge, getOrderStatusVariant, getPaymentStatusVariant } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { ShoppingBag, DollarSign, Package, Users, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/product';
import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard | RoadsRide',
};

export default async function AdminDashboard() {
  const { success, stats, recentOrders, lowStockProducts, outOfStockProducts, error } = await getDashboardStats();

  if (!success) {
    return <div className="text-red-500 p-6">Error loading dashboard: {error}</div>;
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-black">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back. Here is your store&apos;s summary.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Revenue"
          value={formatPrice(stats.todayRevenue)}
          icon={<DollarSign size={24} />}
          className="border-green-100 bg-green-50/50"
        />
        <StatCard
          title="Today's Orders"
          value={stats.todayOrders}
          icon={<TrendingUp size={24} />}
          className="border-blue-100 bg-blue-50/50"
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users size={24} />}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
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
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No recent orders.
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
                    <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={getOrderStatusVariant(order.orderStatus)} className="capitalize">
                        {order.orderStatus}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Inventory Alerts */}
        <div className="space-y-6">
          <div className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-border flex items-center gap-2 bg-red-50/50">
              <XCircle size={18} className="text-red-500" />
              <h2 className="font-bold text-red-900">Out of Stock</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {outOfStockProducts.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No products out of stock.</div>
              ) : (
                outOfStockProducts.map(p => (
                  <div key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <span className="text-sm font-medium text-brand-black line-clamp-1">{p.name}</span>
                    <Badge variant="destructive">0 in stock</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-brand-border flex items-center gap-2 bg-yellow-50/50">
              <AlertTriangle size={18} className="text-yellow-600" />
              <h2 className="font-bold text-yellow-900">Low Stock Alert</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {lowStockProducts.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">Inventory levels are healthy.</div>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                    <span className="text-sm font-medium text-brand-black line-clamp-1 pr-4">{p.name}</span>
                    <Badge variant="warning">{p.stock} left</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
