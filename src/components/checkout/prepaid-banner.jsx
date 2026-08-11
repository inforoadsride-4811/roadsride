'use client';

import { Shield } from 'lucide-react';
import { formatPrice } from '@/lib/product';

export default function PrepaidBanner({ discountAmount, isPrepaid }) {
  if (isPrepaid) {
    return (
      <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-4 flex flex-col gap-2.5">
        <h3 className="font-bold text-[#166534] text-base mb-1">Prepaid Order Benefits:</h3>
        <p className="text-sm font-semibold text-[#166534] flex items-center gap-2">
          ✅ Extra 5% Off
        </p>
        <p className="text-sm font-semibold text-[#166534] flex items-center gap-2">
          ✅ Free Delivery
        </p>
        <p className="text-sm font-semibold text-[#166534] flex items-center gap-2">
          ✅ Priority Processing
        </p>
        <p className="text-sm font-semibold text-[#166534] flex items-center gap-2">
          ✅ FREE Surprise Gift 🎁
        </p>
      </div>
    );
  }

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
