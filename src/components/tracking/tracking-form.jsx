'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackOrderByNumber } from '@/actions/tracking';
import { useToast } from '@/components/ui/toast';

export default function TrackingForm({ onResult }) {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    try {
      const { success, order, error } = await trackOrderByNumber(orderNumber.trim());
      
      if (success) {
        onResult(order);
      } else {
        addToast({ title: 'Tracking Failed', message: error || 'Order not found', type: 'error' });
        onResult(null);
      }
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to track order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl border border-brand-border shadow-sm max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-brand-black mb-2 text-center">Track Your Order</h2>
      <p className="text-sm text-gray-500 mb-6 text-center">
        Enter your order number (e.g., RR-XXXX-XXXX) to check its status.
      </p>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          placeholder="Enter Order Number"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading} className="whitespace-nowrap flex-shrink-0">
          {loading ? 'Tracking...' : (
            <>
              <Search size={18} /> Track
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
