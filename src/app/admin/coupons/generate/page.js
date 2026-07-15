'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { generateCoupons } from '@/actions/admin-coupons';
import Link from 'next/link';

export default function GenerateCouponsPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    count: 50,
    prefix: 'SUMMER',
    suffix: '',
    length: 6,
    useNumbers: true,
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    endDate: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await generateCoupons(formData);
      if (res.success) {
        addToast({ title: `Generated ${res.count} coupons successfully!`, type: 'success' });
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-brand-black">Bulk Generate Coupons</h1>
        <p className="text-sm text-gray-500 mt-1">Generate multiple unique coupon codes with the same rules.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 border-b pb-2">Code Format</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Coupons *</label>
                <Input
                  name="count"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.count}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix (Optional)</label>
                <Input
                  name="prefix"
                  value={formData.prefix}
                  onChange={handleChange}
                  placeholder="e.g. WIN"
                  className="uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Random Part Length *</label>
                <Input
                  name="length"
                  type="number"
                  min="3"
                  max="15"
                  value={formData.length}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg text-sm flex items-center gap-2">
              <span className="font-semibold">Example Output:</span>
              <span className="font-mono bg-white px-2 py-1 border border-gray-200 rounded text-brand-black tracking-widest">
                {formData.prefix.toUpperCase()}{'A'.repeat(formData.length)}{formData.suffix.toUpperCase()}
              </span>
            </div>
          </div>

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
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Value *</label>
                <Input
                  name="discountValue"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discountValue}
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

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Link href="/admin/coupons">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="bg-brand-black text-white hover:bg-gray-800" disabled={isSubmitting}>
              {isSubmitting ? 'Generating...' : <><Tag size={18} className="mr-2" /> Generate {formData.count} Coupons</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
