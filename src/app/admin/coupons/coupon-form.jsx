'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import { createCoupon, updateCoupon } from '@/actions/admin-coupons';
import useAdminStore from '@/store/admin';

export default function CouponForm({ initialData = null }) {
  const router = useRouter();
  const { addToast } = useToast();
  const setDirty = useAdminStore((s) => s.setDirty);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    code: initialData?.code || '',
    description: initialData?.description || '',
    internalNotes: initialData?.internalNotes || '',
    discountType: initialData?.discountType || 'percentage',
    discountValue: initialData?.discountValue || '',
    minOrderAmount: initialData?.minOrderAmount || '',
    maxDiscountAmount: initialData?.maxDiscountAmount || '',
    minQuantity: initialData?.minQuantity || '1',
    applicableTo: initialData?.applicableTo || 'all',
    maxTotalUses: initialData?.maxTotalUses || '',
    maxPerUser: initialData?.maxPerUser || '1',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    userRestriction: initialData?.userRestriction || 'all',
    isStackable: initialData?.isStackable || false,
    isAutoApply: initialData?.isAutoApply || false,
    isActive: initialData?.isActive !== false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setDirty(true);
  };

  const handleGenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, code }));
    setDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const dataToSubmit = { ...formData };
      
      // Clean up empty numbers to null
      ['minOrderAmount', 'maxDiscountAmount', 'maxTotalUses'].forEach(field => {
        if (dataToSubmit[field] === '') dataToSubmit[field] = null;
      });

      const res = initialData
        ? await updateCoupon(initialData.id, dataToSubmit)
        : await createCoupon(dataToSubmit);

      if (res.success) {
        addToast({ title: `Coupon ${initialData ? 'updated' : 'created'} successfully!`, type: 'success' });
        setDirty(false);
        router.push('/admin/coupons');
      } else {
        addToast({ title: 'Error', message: res.error, type: 'error' });
      }
    } catch (error) {
      console.error(error);
      addToast({ title: 'Error', message: 'Something went wrong', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      {/* Basic Info */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code *</label>
            <div className="flex gap-2">
              <Input
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="e.g. SUMMER20"
                required
                className="uppercase font-mono"
              />
              <Button type="button" variant="outline" onClick={handleGenerateCode}>Generate</Button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Summer Sale 2024"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Public Description</label>
            <Input
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g. Get 20% off on your summer purchases"
            />
          </div>
        </div>
      </div>

      {/* Discount Rules */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Discount Rules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
            <select
              name="discountType"
              value={formData.discountType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-brand-yellow outline-none text-sm"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
              <option value="flat_price">Flat Price Override (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
            <Input
              name="discountValue"
              type="number"
              step="0.01"
              value={formData.discountValue}
              onChange={handleChange}
              placeholder="e.g. 20"
              required
            />
          </div>
          {formData.discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount Amount (₹)</label>
              <Input
                name="maxDiscountAmount"
                type="number"
                step="0.01"
                value={formData.maxDiscountAmount}
                onChange={handleChange}
                placeholder="Leave blank for no limit"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
            <Input
              name="minOrderAmount"
              type="number"
              step="0.01"
              value={formData.minOrderAmount}
              onChange={handleChange}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Usage Limits & Dates</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Total Uses (Across all users)</label>
            <Input
              name="maxTotalUses"
              type="number"
              value={formData.maxTotalUses}
              onChange={handleChange}
              placeholder="Leave blank for unlimited"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses Per User *</label>
            <Input
              name="maxPerUser"
              type="number"
              value={formData.maxPerUser}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
            <Input
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
            <Input
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Settings</h2>
        
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 text-brand-yellow rounded border-gray-300"
            />
            <div>
              <span className="font-medium text-gray-900 block">Coupon Active</span>
              <span className="text-xs text-gray-500">Customers can use this coupon if active</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isAutoApply"
              checked={formData.isAutoApply}
              onChange={handleChange}
              className="w-5 h-5 text-brand-yellow rounded border-gray-300"
            />
            <div>
              <span className="font-medium text-gray-900 block">Auto-Apply at Checkout</span>
              <span className="text-xs text-gray-500">Automatically apply this coupon to eligible carts</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isStackable"
              checked={formData.isStackable}
              onChange={handleChange}
              className="w-5 h-5 text-brand-yellow rounded border-gray-300"
            />
            <div>
              <span className="font-medium text-gray-900 block">Stackable</span>
              <span className="text-xs text-gray-500">Can be used with other stackable coupons at checkout</span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/coupons')}>
          Cancel
        </Button>
        <Button type="submit" className="bg-brand-black text-white hover:bg-gray-800" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : <><Save size={18} className="mr-2" /> Save Coupon</>}
        </Button>
      </div>
    </form>
  );
}
