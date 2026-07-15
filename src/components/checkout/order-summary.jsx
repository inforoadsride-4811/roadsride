'use client';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/product';
import useCartStore from '@/store/cart';
import { useToast } from '@/components/ui/toast';
import { Plus, Tag, X } from 'lucide-react';

export default function OrderSummary({
  items,
  subtotal,
  shipping,
  discount,
  total,
  isPrepaid,
  recommendations = [],
  appliedCoupons = [],
  couponError = '',
  couponLoading = false,
  onApplyCoupon,
  onRemoveCoupon
}) {
  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToast();
  const [localCouponCode, setLocalCouponCode] = useState('');

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

  const handleApplyClick = (e) => {
    e.preventDefault();
    if (localCouponCode && onApplyCoupon) {
      onApplyCoupon(localCouponCode);
      setLocalCouponCode('');
    }
  };

  const totalCouponDiscount = appliedCoupons.reduce((sum, c) => sum + c.discountAmount, 0);

  return (
    <div className="bg-gray-50 p-6 border border-brand-border rounded-xl">
      <h3 className="text-lg font-bold text-brand-black mb-6">Order Summary</h3>

      <div className="space-y-4 mb-6">
        {items.map((item) => {
          let borderColor = 'border-brand-black';
          let bgColor = 'bg-green-50/30';
          let badgeBg = 'bg-gray-100 text-gray-700';

          if (item.packIndex === 1) { borderColor = 'border-green-600'; badgeBg = 'bg-green-100 text-green-800'; }
          if (item.packIndex === 2) { borderColor = 'border-blue-600'; badgeBg = 'bg-blue-100 text-blue-800'; }
          if (item.packIndex === 3) { borderColor = 'border-orange-600'; badgeBg = 'bg-orange-100 text-orange-800'; }

          return (
            <div key={item.id} className={`relative flex flex-col rounded-xl border-2 ${borderColor} ${bgColor} overflow-hidden shadow-sm`}>
              {item.badgeText && (
                <div className={`w-full py-1.5 px-3 text-center text-[11px] font-black tracking-wide uppercase ${badgeBg}`}>
                  {item.badgeText}
                </div>
              )}
              <div className="p-4 flex gap-4">
                <div className="w-16 h-16 relative rounded-lg border border-gray-200 bg-white overflow-hidden flex-shrink-0">
                  <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" sizes="64px" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center z-10 border-2 border-white shadow-sm">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h4 className="text-[13px] font-bold text-brand-black leading-tight mb-1">
                    {item.name}
                  </h4>
                  {item.packName && (
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Number of Items: {item.packName}</p>
                  )}
                  {item.keyPoints && item.keyPoints.length > 0 && (
                    <ul className="mb-2 space-y-1">
                      {item.keyPoints.map((point, i) => (
                        <li key={i} className="text-[11px] font-semibold text-gray-800 flex items-start leading-tight">
                          <span className="mr-1 shrink-0">
                            {point.includes('GIFT') || point.includes('🎁') ? '🎁' : (point.includes('❌') ? '❌' : '•')}
                          </span>
                          <span className="pt-[1px]">{point.replace(/^(🎁|❌|•|\s)+/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex justify-between items-end mt-auto pt-1 border-t border-black/5">
                    <div>
                      {item.savingsText && (
                        <p className="text-[10px] text-gray-500 font-bold">{item.savingsText}</p>
                      )}
                    </div>
                    <div className="text-[15px] font-black text-brand-black leading-none">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coupon Section */}
      <div className="mb-6 pt-4 border-t border-brand-border">
        {appliedCoupons.length > 0 && (
          <div className="space-y-2 mb-3">
            {appliedCoupons.map(coupon => (
              <div key={coupon.code} className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">
                      <Tag size={16} />
                    </span>
                    <span className="font-bold text-green-800 tracking-wide">{coupon.code}</span>
                    {coupon.isStackable && (
                      <span className="text-[10px] bg-green-200 text-green-800 px-1.5 py-0.5 rounded font-semibold ml-1">STACKED</span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-green-700 mt-1 ml-6">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off applied` :
                      coupon.discountType === 'fixed' ? `₹${coupon.discountValue} flat discount` :
                        `₹${coupon.discountValue} price override`}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveCoupon(coupon.code)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  disabled={couponLoading}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {(appliedCoupons.length === 0 || appliedCoupons.every(c => c.isStackable)) && (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Discount code"
                value={localCouponCode}
                onChange={(e) => setLocalCouponCode(e.target.value.toUpperCase())}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-black uppercase"
                disabled={couponLoading}
              />
              <button
                onClick={handleApplyClick}
                disabled={!localCouponCode || couponLoading}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {couponLoading ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {couponError && (
              <p className="text-red-500 text-xs mt-2 font-medium">{couponError}</p>
            )}
          </div>
        )}
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

        {totalCouponDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <span>Coupon Discount</span>
            <span>-{formatPrice(totalCouponDiscount)}</span>
          </div>
        )}

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
