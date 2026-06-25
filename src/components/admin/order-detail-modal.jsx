'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/product';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { updateOrderDetails } from '@/actions/admin';
import { useRouter } from 'next/navigation';
import { generateOrderConfirmationHTML, generateAdminOrderNotificationHTML } from '@/lib/email-template';
import { Loader2, User, Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [previewEmail, setPreviewEmail] = useState(null); // 'customer' or 'admin'
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    orderStatus: 'pending',
    paymentStatus: 'pending',
    paymentMode: '',
    amountCollected: '',
  });

  useEffect(() => {
    if (order) {
      setFormData({
        customerName: order.customerName || '',
        email: order.email || '',
        phone: order.phone || '',
        address: order.address || '',
        apartment: order.apartment || '',
        city: order.city || '',
        state: order.state || '',
        pincode: order.pincode || '',
        orderStatus: order.orderStatus || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        paymentMode: order.paymentMode || '',
        amountCollected: order.amountCollected ? String(order.amountCollected) : '',
      });
    }
  }, [order]);

  if (!order) return null;

  const isEmailSent = (order.paymentMethod === 'cod' && order.orderStatus !== 'pending') || (order.paymentStatus === 'paid');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await updateOrderDetails(order.id, formData);
      if (res.success) {
        addToast({ title: 'Success', message: 'Order updated successfully', type: 'success' });
        router.refresh();
        onClose();
      } else {
        addToast({ title: 'Error', message: res.error || 'Failed to update order', type: 'error' });
      }
    } catch (error) {
      addToast({ title: 'Error', message: 'Failed to update order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fullAddress = [order.address, order.apartment, order.city, order.state, order.pincode].filter(Boolean).join(', ') || 'Not provided';

  return (
    <Dialog open={open} onClose={onClose} title={`Order Details: ${order.orderNumber}`} maxWidth="max-w-5xl">
      <form onSubmit={handleUpdate} className="overflow-y-auto max-h-[85vh]">
        
        {/* Top Info Bar - Read-only overview */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="w-10 h-10 bg-brand-yellow/10 rounded-full flex items-center justify-center">
                <User size={18} className="text-brand-yellow" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Customer</p>
                <p className="text-sm font-semibold text-gray-900">{order.customerName || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-[180px]">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Mail size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email</p>
                <p className="text-sm font-medium text-gray-900">{order.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-[150px]">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <Phone size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Phone</p>
                <p className="text-sm font-medium text-gray-900">{order.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-[150px]">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Location</p>
                <p className="text-sm font-medium text-gray-900">{order.city || 'N/A'}{order.state ? `, ${order.state}` : ''}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-6 mt-3 text-xs text-gray-500 items-center">
            <span><span className="font-medium">Created:</span> {new Date(order.createdAt).toLocaleString()}</span>
            <span><span className="font-medium">Payment:</span> <span className="uppercase">{order.paymentMethod}</span></span>
            <span><span className="font-medium">Order Value:</span> <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span></span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Col: Editable form fields */}
            <div className="flex-1 space-y-7">
              
              {/* Order & Payment Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Status Updates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                    <select 
                      name="orderStatus"
                      value={formData.orderStatus}
                      onChange={handleChange}
                      className="w-full h-[44px] px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white text-sm"
                    >
                      {ORDER_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select 
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleChange}
                      className="w-full h-[44px] px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white text-sm"
                    >
                      {PAYMENT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input label="Customer Name" name="customerName" value={formData.customerName} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="Apartment, suite, etc." name="apartment" value={formData.apartment} onChange={handleChange} />
                  </div>
                  <div>
                    <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                  </div>
                  <div>
                    <Input label="State" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                  <div className="md:col-span-2">
                    <Input label="PIN Code" name="pincode" type="tel" value={formData.pincode} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Payment Collection */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment Collection</h3>
                <div className="bg-gray-50 p-4 border border-gray-200 rounded-xl space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Collection Mode</label>
                      <select
                        name="paymentMode"
                        value={formData.paymentMode}
                        onChange={handleChange}
                        className="w-full h-[44px] px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white text-sm"
                      >
                        <option value="">Not collected</option>
                        <option value="upi">UPI</option>
                        <option value="cash">Cash</option>
                      </select>
                    </div>
                    <div>
                      <Input
                        label="Amount Collected (₹)"
                        name="amountCollected"
                        type="number"
                        value={formData.amountCollected}
                        onChange={handleChange}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  {formData.paymentMode && formData.amountCollected && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      <span>
                        ₹{parseFloat(formData.amountCollected).toFixed(2)} collected via <span className="font-semibold uppercase">{formData.paymentMode}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
            
            {/* Right Col: Order Summary */}
            <div className="w-full lg:w-[380px]">
              <div className="sticky top-0 space-y-6">
                
                {/* Email Notifications */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Email Notifications</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-brand-border space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">Status:</span>
                      <Badge variant={isEmailSent ? 'success' : 'secondary'}>
                        {isEmailSent ? 'Emails Sent' : 'Pending'}
                      </Badge>
                    </div>
                    {isEmailSent && (
                      <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
                        <Button type="button" variant="outline" size="sm" onClick={() => setPreviewEmail('customer')} className="w-full justify-start text-left">
                          Preview Customer Email
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => setPreviewEmail('admin')} className="w-full justify-start text-left">
                          Preview Admin Email
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cart Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Items</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-brand-border space-y-4">
                    {order.items && order.items.length > 0 ? order.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 line-clamp-1">{item.productName}</p>
                          {item.packName && (
                            <p className="text-xs text-gray-500">Pack: {item.packName}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-0.5">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500">No items found</p>
                    )}
                    
                    <div className="border-t border-gray-200 pt-3 mt-3 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span className="font-medium">{formatPrice(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="font-medium">{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-brand-success">
                          <span>Discount</span>
                          <span className="font-medium">-{formatPrice(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-200 mt-2">
                        <span>Total</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save buttons */}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </form>

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
