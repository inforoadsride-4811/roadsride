'use client';

import { Shield } from 'lucide-react';
import { formatPrice } from '@/lib/product';

export default function PrepaidBanner({ discountAmount }) {
  if (!discountAmount || discountAmount <= 0) return null;

  return (
    <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-4 flex items-start gap-3">
      <div className="bg-brand-yellow text-brand-black rounded-full p-1.5 mt-0.5">
        <Shield size={16} />
      </div>
      <div>
        <p className="text-sm font-semibold text-brand-black">
          Save extra {formatPrice(discountAmount)} with Prepaid Order
        </p>
        <p className="text-xs text-gray-600 mt-0.5">
          Choose Online Payment (UPI/Card/NetBanking) to automatically apply a 5% discount to your order.
        </p>
      </div>
    </div>
  );
}
