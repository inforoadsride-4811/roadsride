'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/product';

export default function OrderSummary({ items, subtotal, shipping, discount, total, isPrepaid }) {
  return (
    <div className="bg-gray-50 p-6 border border-brand-border rounded-xl">
      <h3 className="text-lg font-bold text-brand-black mb-6">Order Summary</h3>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-16 relative rounded-lg border border-brand-border bg-white overflow-hidden flex-shrink-0">
              <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10 border-2 border-white">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <h4 className="text-sm font-medium text-brand-black line-clamp-2 leading-snug">
                {item.name}
              </h4>
              {item.packName && (
                <p className="text-xs text-gray-500 mt-0.5">Number of Items: {item.packName}</p>
              )}
              <div className="text-sm font-bold text-brand-black mt-1">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-brand-border pt-4 space-y-3 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span className="font-medium text-brand-black">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span className="font-medium text-brand-black">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>

        {isPrepaid && discount > 0 && (
          <div className="flex justify-between text-brand-success font-medium">
            <span>Prepaid Discount (5%)</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
      </div>

      {!isPrepaid && (
        <div className="mt-4 bg-orange-50/50 border border-orange-100 text-[#ea580c] text-[13px] font-medium px-3 py-2.5 rounded-lg flex items-start gap-1.5">
          <span>🚚</span>
          <p>Please order only if you are ready to receive the parcel.</p>
        </div>
      )}

      {isPrepaid && (
        <div className="mt-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg p-3 flex flex-col gap-2">
          <h3 className="font-bold text-[#166534] text-sm mb-0.5">Prepaid Order Benefits:</h3>
          <p className="text-[13px] font-semibold text-[#166534] flex items-center gap-2 m-0 leading-tight">
            ✅ Extra 5% Off on Prepaid Orders
          </p>
          <p className="text-[13px] font-semibold text-[#166534] flex items-center gap-2 m-0 leading-tight">
            ✅ Priority Processing
          </p>
          <p className="text-[13px] font-semibold text-[#166534] flex items-center gap-2 m-0 leading-tight">
            ✅ FREE Surprise Gift 🎁
          </p>
        </div>
      )}

      <div className="border-t border-brand-border mt-4 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-base font-bold text-brand-black">Total</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-brand-black">{formatPrice(total)}</span>
            <p className="text-xs text-gray-500">Including taxes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
