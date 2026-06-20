'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge, getOrderStatusVariant, getPaymentStatusVariant } from '@/components/ui/badge';
import { formatPrice } from '@/lib/product';
import { Pagination } from '@/components/ui/pagination';
import OrderDetailModal from '@/components/admin/order-detail-modal';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function OrdersClient({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const { orders, pagination } = initialData;

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-brand-black">Orders Management</h1>
        
        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64"
          />
          <button type="submit" className="p-2.5 bg-brand-black text-white rounded-lg hover:bg-gray-800 transition-colors">
            <Search size={18} />
          </button>
        </form>
      </div>

      <div className="bg-white border border-brand-border rounded-xl shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell className="font-medium text-brand-black">{order.orderNumber}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{order.firstName} {order.lastName}</span>
                      <span className="text-xs text-gray-500">{order.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-brand-black">{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-xs font-semibold text-gray-500 uppercase">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                      <Badge variant={getPaymentStatusVariant(order.paymentStatus)} className="uppercase text-[10px] px-1.5 py-0">
                        {order.paymentStatus}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {((order.paymentMethod === 'cod' && order.orderStatus !== 'pending') || order.paymentStatus === 'paid') ? (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0">Sent</Badge>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">—</span>
                    )}
                  </TableCell>
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

        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-brand-border flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium">{pagination.total}</span> orders
            </p>
            <Pagination 
              currentPage={pagination.page} 
              totalPages={pagination.pages} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </div>

      <OrderDetailModal 
        order={selectedOrder} 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
      />
    </div>
  );
}
