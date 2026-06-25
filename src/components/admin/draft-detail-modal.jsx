'use client';

import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/product';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { adminUpdateDraft } from '@/actions/drafts';
import { useRouter } from 'next/navigation';
import { Loader2, User, Mail, Phone, MapPin, Clock, CheckCircle2, XCircle, MessageCircle, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: Clock },
  completed: { label: 'Completed', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle2 },
  pending: { label: 'Pending', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: AlertCircle },
  contacted: { label: 'Contacted', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: MessageCircle },
  rejected: { label: 'Rejected', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
};

export default function DraftDetailModal({ draft, open, onClose }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    pincode: '',
    status: 'draft',
    paymentMode: '',
    amountCollected: '',
  });

  useEffect(() => {
    if (draft) {
      setFormData({
        firstName: draft.firstName || '',
        lastName: draft.lastName || '',
        email: draft.email || '',
        phone: draft.phone || '',
        address: draft.address || '',
        apartment: draft.apartment || '',
        city: draft.city || '',
        state: draft.state || '',
        pincode: draft.pincode || '',
        status: draft.status || 'draft',
        paymentMode: draft.paymentMode || '',
        amountCollected: draft.amountCollected ? String(draft.amountCollected) : '',
      });
    }
  }, [draft]);

  if (!draft) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await adminUpdateDraft(draft.id, formData);
    
    setLoading(false);
    
    if (res.success) {
      addToast({ title: 'Success', message: 'Draft updated successfully', type: 'success' });
      onClose();
      router.refresh();
    } else {
      addToast({ title: 'Error', message: res.error || 'Failed to update draft', type: 'error' });
    }
  };

  const fullName = [draft.firstName, draft.lastName].filter(Boolean).join(' ') || 'Unknown';
  const fullAddress = [draft.address, draft.apartment, draft.city, draft.state, draft.pincode].filter(Boolean).join(', ') || 'Not provided';
  const statusInfo = STATUS_CONFIG[draft.status] || STATUS_CONFIG.draft;
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onClose={onClose} title="Draft Details" maxWidth="max-w-5xl">
      <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[85vh]">
        
        {/* Top Info Bar - Read-only overview */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="w-10 h-10 bg-brand-yellow/10 rounded-full flex items-center justify-center">
                <User size={18} className="text-brand-yellow" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Customer</p>
                <p className="text-sm font-semibold text-gray-900">{fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-[180px]">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Mail size={18} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Email</p>
                <p className="text-sm font-medium text-gray-900">{draft.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-[150px]">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <Phone size={18} className="text-green-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Phone</p>
                <p className="text-sm font-medium text-gray-900">{draft.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 min-w-[150px]">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin size={18} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Location</p>
                <p className="text-sm font-medium text-gray-900">{draft.city || 'N/A'}{draft.state ? `, ${draft.state}` : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}>
                <StatusIcon size={12} /> {statusInfo.label}
              </span>
            </div>
          </div>
          <div className="flex gap-6 mt-3 text-xs text-gray-500">
            <span><span className="font-medium">Created:</span> {new Date(draft.createdAt).toLocaleString()}</span>
            <span><span className="font-medium">Last Updated:</span> {new Date(draft.updatedAt).toLocaleString()}</span>
            <span><span className="font-medium">Order Value:</span> <span className="font-semibold text-gray-900">{formatPrice(draft.total)}</span></span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Col: Editable form fields */}
            <div className="flex-1 space-y-7">
              
              {/* Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
                <select 
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full max-w-xs h-[44px] px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-yellow/50 focus:border-brand-yellow bg-white text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="contacted">Contacted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div>
                    <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                  </div>
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
                  <div>
                    <Input label="PIN Code" name="pincode" type="tel" value={formData.pincode} onChange={handleChange} />
                  </div>
                  <div>
                    <Input label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
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
                {/* Cart Items */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cart Items</h3>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                    {Array.isArray(draft.cartItems) ? draft.cartItems.map((item, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        {item.image ? (
                          <img src={item.image} alt={item.productName} className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <div className="w-14 h-14 bg-gray-200 rounded-lg border border-gray-300 flex items-center justify-center text-[10px] text-gray-500">No Img</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{item.productName}</p>
                          {item.packName && (
                            <p className="text-xs text-gray-500">Number of Items: {item.packName}</p>
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
                        <span className="font-medium">{formatPrice(draft.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Shipping</span>
                        <span className="font-medium">{draft.shipping === 0 ? 'Free' : formatPrice(draft.shipping)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-200 mt-2">
                        <span>Total</span>
                        <span>{formatPrice(draft.total)}</span>
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
    </Dialog>
  );
}
