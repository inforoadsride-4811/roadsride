'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/product';
import { Dialog } from '@/components/ui/dialog';
import { Badge, getOrderStatusVariant, getPaymentStatusVariant } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { updateOrderStatus, updatePaymentStatus } from '@/actions/admin';
import { useRouter } from 'next/navigation';
import { generateOrderConfirmationHTML, generateAdminOrderNotificationHTML } from '@/lib/email-template';

const ORDER_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

const PAYMENT_STATUSES = [
  { label: 'Pending', value: 'pending' },
  { label: 'Paid', value: 'paid' },
  { label: 'Failed', value: 'failed' },
];

export default function OrderDetailModal({ order, open, onClose }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order?.orderStatus || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || 'pending');
  const [previewEmail, setPreviewEmail] = useState(null); // 'customer' or 'admin'

  useEffect(() => {
    if (order) {
      setOrderStatus(order.orderStatus || 'pending');
      setPaymentStatus(order.paymentStatus || 'pending');
    }
  }, [order]);

  if (!order) return null;

  const isEmailSent = (order.paymentMethod === 'cod' && order.orderStatus !== 'pending') || (order.paymentStatus === 'paid');

  const handleUpdate = async () => {
    setLoading(true);
    try {
      if (orderStatus !== order.orderStatus) {
        await updateOrderStatus(order.id, orderStatus);
      }
      if (paymentStatus !== order.paymentStatus) {
        await updatePaymentStatus(order.id, paymentStatus);
      }
      addToast({ title: 'Success', message: 'Order updated successfully', type: 'success' });
      router.refresh();
      onClose();
    } catch (error) {
      addToast({ title: 'Error', message: 'Failed to update order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={`Order Details: ${order.orderNumber}`} maxWidth="max-w-4xl">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Col: Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-brand-border space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {order.firstName} {order.lastName}</p>
                <p><span className="font-medium">Email:</span> {order.email}</p>
                <p><span className="font-medium">Phone:</span> {order.phone}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-brand-border text-sm">
                <p>{order.address}</p>
                <p>{order.city}, {order.state} {order.pincode}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Status Updates</h3>
              <div className="space-y-4">
                <Select 
                  label="Order Status"
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  options={ORDER_STATUSES}
                />
                <Select 
                  label="Payment Status"
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  options={PAYMENT_STATUSES}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Email Notifications</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-brand-border space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge variant={isEmailSent ? 'success' : 'secondary'}>
                    {isEmailSent ? 'Emails Sent' : 'Pending'}
                  </Badge>
                </div>
                {isEmailSent && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                    <Button variant="outline" size="sm" onClick={() => setPreviewEmail('customer')} className="w-full justify-start text-left">
                      Preview Customer Email
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPreviewEmail('admin')} className="w-full justify-start text-left">
                      Preview Admin Email
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Items & Summary */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
              <div className="border border-brand-border rounded-lg overflow-hidden divide-y divide-brand-border">
                {order.items.map((item) => (
                  <div key={item.id} className="p-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-brand-black line-clamp-1">{item.productName}</p>
                      <p className="text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    </div>
                    <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Financials</h3>
              <div className="bg-gray-50 p-4 rounded-lg border border-brand-border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium uppercase">{order.paymentMethod}</span>
                </div>
                {order.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span>Razorpay ID:</span>
                    <span className="font-medium font-mono">{order.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 my-2 pt-2"></div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-brand-success">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-brand-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={loading || (orderStatus === order.orderStatus && paymentStatus === order.paymentStatus)}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {previewEmail && (
        <Dialog open={true} onClose={() => setPreviewEmail(null)} title={`Preview: ${previewEmail === 'customer' ? 'Customer Email' : 'Admin Notification'}`} maxWidth="max-w-2xl">
          <div className="p-4 h-[600px] flex flex-col">
            <iframe
              srcDoc={previewEmail === 'customer' ? generateOrderConfirmationHTML(order) : generateAdminOrderNotificationHTML(order)}
              className="w-full flex-1 border border-brand-border rounded bg-white"
              title="Email Preview"
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setPreviewEmail(null)}>Close Preview</Button>
            </div>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
}
