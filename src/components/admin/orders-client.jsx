'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge, getOrderStatusVariant, getPaymentStatusVariant } from '@/components/ui/badge';
import { formatPrice } from '@/lib/product';
import { Pagination } from '@/components/ui/pagination';
import OrderDetailModal from '@/components/admin/order-detail-modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Search, Trash2, Loader2 } from 'lucide-react';
import { bulkDeleteOrders, bulkUpdateOrderStatus } from '@/actions/admin';

export default function OrdersClient({ initialData }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(orders.map(o => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e, id) => {
    // Prevent row click when clicking checkbox
    e.stopPropagation();
    if (e.target.checked) {
      if (selectedIds.length >= 10) {
        addToast({ title: 'Limit Reached', message: 'Maximum 10 records can be selected at once', type: 'error' });
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} orders? This cannot be undone.`)) return;

    setIsDeleting(true);
    try {
      const result = await bulkDeleteOrders(selectedIds);
      if (result.success) {
        addToast({ title: 'Success', message: `Successfully deleted ${selectedIds.length} orders`, type: 'success' });
        setSelectedIds([]);
        router.refresh();
      } else {
        addToast({ title: 'Error', message: result.error || 'Failed to delete orders', type: 'error' });
      }
    } catch (error) {
      addToast({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkStatusChange = async (e) => {
    const status = e.target.value;
    if (!status || selectedIds.length === 0) return;

    if (!confirm(`Update ${selectedIds.length} orders to '${status}'?`)) {
      e.target.value = ''; // Reset select
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const result = await bulkUpdateOrderStatus(selectedIds, status);
      if (result.success) {
        addToast({ title: 'Success', message: `Updated ${selectedIds.length} orders`, type: 'success' });
        setSelectedIds([]);
        router.refresh();
      } else {
        addToast({ title: 'Error', message: result.error || 'Failed to update orders', type: 'error' });
      }
    } catch (error) {
      addToast({ title: 'Error', message: 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsUpdatingStatus(false);
      e.target.value = ''; // Reset select
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-brand-black">Orders Management</h1>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 mr-2">
              <select
                className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 disabled:opacity-50"
                onChange={handleBulkStatusChange}
                disabled={isUpdatingStatus || isDeleting}
                defaultValue=""
              >
                <option value="" disabled>Change Status...</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <Button
                type="button"
                variant="danger"
                size="sm"
                className="whitespace-nowrap px-4"
                onClick={handleBulkDelete}
                disabled={isDeleting || isUpdatingStatus}
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete ({selectedIds.length})
              </Button>
            </div>
          )}
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
              <TableHead className="w-[50px] text-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={orders.length > 0 && selectedIds.length === orders.length}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  className={`hover:bg-gray-50 ${selectedIds.includes(order.id) ? 'bg-blue-50/50' : ''}`}
                >
                  <TableCell className="w-[50px] text-center">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedIds.includes(order.id)}
                      onChange={(e) => handleSelectOne(e, order.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-brand-black">{order.orderNumber}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">{order.customerName}</span>
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
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                      View
                    </Button>
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
