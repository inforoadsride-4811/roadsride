'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/product';
import useCartStore from '@/store/cart';
import { useToast } from '@/components/ui/toast';
import { Plus } from 'lucide-react';

export default function OrderSummary({ items, subtotal, shipping, discount, total, isPrepaid, recommendations = [] }) {
  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToast();

  const suggestedProducts = useMemo(() => {
    if (!recommendations || recommendations.length === 0) return [];
    // Filter out items already in cart
    const inCartIds = new Set(items.map(i => i.id));
    const available = recommendations.filter(p => !inCartIds.has(p.id) && p.stock > 0);
    // Shuffle and pick 3
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [recommendations, items]);

  const handleAddSuggestion = (product) => {
    addItem(product, 1);
    addToast({
      title: 'Added to cart',
      message: `${product.name} added to your order.`,
      type: 'success',
    });
  };

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

      {suggestedProducts.length > 0 && (
        <div className="mt-6 border-t border-brand-border pt-6">
          <h4 className="text-sm font-bold text-brand-black mb-3">You might also like</h4>
          <div className="space-y-3">
            {suggestedProducts.map(product => (
              <div key={product.id} className="flex gap-3 items-center border border-gray-100 bg-white p-2 rounded-lg shadow-sm">
                <div className="w-12 h-12 relative rounded bg-gray-50 flex-shrink-0">
                  {product.images?.[0]?.src && (
                    <Image src={product.images[0].src} alt={product.name} fill className="object-cover rounded" sizes="48px" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-medium text-brand-black truncate">{product.name}</h5>
                  <p className="text-xs font-bold text-brand-black mt-0.5">{formatPrice(product.price)}</p>
                </div>
                <button 
                  onClick={() => handleAddSuggestion(product)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-yellow text-brand-black hover:bg-yellow-400 transition-colors flex-shrink-0"
                  aria-label="Add to cart"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-brand-border mt-6 pt-4">
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
