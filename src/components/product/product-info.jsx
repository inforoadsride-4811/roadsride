'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, StarHalf, Minus, Plus, Truck, ShieldCheck, RotateCcw, MessageCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import useCartStore from '@/store/cart';
import SalesBadge from './sales-badge';

export default function ProductInfo({ product, selectedPackIndex = 0, onPackSelect = () => { } }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToast();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const packs = product.packs || product.variants || [];
  const currentPack = packs.length > 0 ? packs[selectedPackIndex] : null;
  const displayPrice = currentPack?.price || product.price;
  const displayOriginalPrice = currentPack?.originalPrice || product.originalPrice;
  const effectiveStock = currentPack ? (currentPack.stock || 0) : (product.variants?.length > 0 ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : product.stock);
  const displayImages = currentPack?.images?.length > 0 ? currentPack.images : (product.images || []);
  const store = product.store || { name: 'RoadsRide' };

  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
    : 5;
  const roundedRating = Math.round(averageRating);

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => Math.min(prev + 1, product.stock));
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const getPackProduct = () => ({
    ...product,
    id: currentPack?.id || product.id,
    name: product.name,
    packName: currentPack?.name || '',
    price: displayPrice,
    originalPrice: displayOriginalPrice,
    images: displayImages,
  });

  const handleAddToCart = () => {
    const packProduct = getPackProduct();
    addItem(packProduct, quantity);
    addToast({
      title: 'Added to cart',
      message: `${quantity} × ${packProduct.name} added to your cart.`,
      type: 'success',
    });
  };

  const handleOrderNow = () => {
    setIsNavigating(true);
    addItem(getPackProduct(), quantity);
    router.push('/checkout?payment=Cash On Delivery');
  };

  const trustItems = [
    { icon: Truck, label: 'All India Delivery' },
    { icon: ShieldCheck, label: 'Secure Payment' },
    { icon: RotateCcw, label: '10 Day Returns' },
    { icon: MessageCircle, label: '24/7 Support' },
  ];

  return (
    <>
      <div className="flex w-full flex-col gap-5 lg:pt-1" style={{ maxWidth: '570px' }}>
        {/* Title */}
        <h1 className="font-poppins font-bold text-2xl leading-snug text-brand-black lg:text-[26px]">
          {product.name}
        </h1>

        {/* Rating and Stock */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              window.dispatchEvent(new CustomEvent('open-reviews-tab'));
            }}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center text-brand-yellow">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < roundedRating ? 'currentColor' : 'none'}
                  className={i < roundedRating ? '' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500">
              ({reviewCount} customer review{reviewCount !== 1 ? 's' : ''})
            </span>
          </button>

          <div className="flex items-center gap-1.5 text-brand-black">
            {effectiveStock > 0 ? (
              <>
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-sm font-bold text-green-700">In stock</span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-red-600">Out of stock</span>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {displayOriginalPrice > displayPrice && (
            <span className="font-montserrat font-bold text-sm text-gray-500 line-through">
              {product.currency}
              {displayOriginalPrice.toFixed(2)}
            </span>
          )}
          <span className="font-montserrat text-xl font-bold leading-none text-brand-black">
            {product.currency}
            {displayPrice.toFixed(2)}
          </span>
        </div>

        {/* Store Card */}
        <div className="flex w-full items-center gap-4 border border-brand-border bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]" style={{ maxWidth: '380px' }}>
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden border border-brand-border bg-white p-1">
            <Image src={displayImages[0]?.src || '/placeholder.png'} alt="Product Thumbnail" width={48} height={48} className="w-full h-full object-cover rounded-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Store</p>
            <p className="text-base font-bold text-brand-black">{store.name}</p>
          </div>
          <div className="h-10 w-px bg-brand-border"></div>
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center gap-0.5 text-brand-yellow">
              {[...Array(4)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill="currentColor"
                  className="text-brand-yellow"
                />
              ))}
              <div className="relative w-4 h-4">
                <Star size={16} className="text-brand-yellow absolute inset-0" fill="transparent" />
                <StarHalf size={16} className="text-brand-yellow absolute inset-0" fill="currentColor" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              4.7 rating (114 reviews)
            </p>
          </div>
        </div>

        {/* Sales Badge */}
        <SalesBadge count={product.soldCount} period={product.soldPeriod} />

        {/* Features */}
        <ul className="space-y-3">
          {product.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
              <div className="flex h-[22.75px] items-center flex-shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-black"></span>
              </div>
              <span className="min-w-0">
                <span className="font-bold text-brand-black">{feature.bold}</span> {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Removed Stock Indicator from here */}

        {/* Packs Variation */}
        {packs.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-brand-black uppercase">Number of Items</p>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-2">
              {packs.map((pack, index) => (
                <button
                  key={pack.id}
                  onClick={() => onPackSelect(index)}
                  className={`relative rounded-md border px-4 py-3 sm:py-2 text-base sm:text-sm font-medium transition-all ${index === selectedPackIndex
                    ? 'border-brand-black bg-gray-50 text-brand-black border-2'
                    : 'border-brand-border bg-gray-50 text-brand-black hover:border-gray-400'
                    }`}
                >
                  {pack.name}
                  {pack.isBestSeller && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-[-5px] sm:translate-x-0 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm uppercase whitespace-nowrap">
                      BEST SELLER
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Quantity selector */}
            <div className="flex h-14 w-full items-center rounded-xl border border-brand-border sm:w-[150px]">
              <button
                onClick={() => handleQuantityChange('dec')}
                aria-label="Decrease quantity"
                className="flex h-full w-14 items-center justify-center rounded-l-xl text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <div className="flex h-full flex-1 items-center justify-center border-x border-brand-border text-base font-semibold text-brand-black">
                {quantity}
              </div>
              <button
                onClick={() => handleQuantityChange('inc')}
                aria-label="Increase quantity"
                className="flex h-full w-14 items-center justify-center rounded-r-xl text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-1">
              <Button onClick={handleAddToCart} size="lg" className="font-poppins font-bold h-14 w-full rounded-full text-sm uppercase tracking-wide whitespace-nowrap">
                Add To Cart
              </Button>
            </div>
          </div>
          <Button onClick={handleOrderNow} disabled={isNavigating} variant="secondary" size="lg" className="font-poppins font-bold h-14 w-full rounded-full text-sm uppercase tracking-wide whitespace-nowrap ">
            {isNavigating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isNavigating ? 'Processing...' : `Order Now - ${product.currency}${(displayPrice * quantity).toFixed(2)} (Cash On Delivery)`}
          </Button>

          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-4 text-center">
                <Icon size={22} className="text-brand-black" />
                <span className="text-xs font-bold leading-snug text-brand-black">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Actions */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-brand-border p-2.5 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] pb-safe">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex h-10 w-24 items-center rounded-xl border border-brand-border bg-gray-50/50 flex-shrink-0">
              <button aria-label="Decrease quantity" onClick={() => handleQuantityChange('dec')} className="flex h-full w-7 items-center justify-center rounded-l-xl text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200">
                <Minus size={14} />
              </button>
              <div className="flex h-full flex-1 items-center justify-center border-x border-brand-border text-sm font-semibold text-brand-black">
                {quantity}
              </div>
              <button aria-label="Increase quantity" onClick={() => handleQuantityChange('inc')} className="flex h-full w-7 items-center justify-center rounded-r-xl text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex flex-1 overflow-x-auto gap-2 items-center py-1 [&::-webkit-scrollbar]:hidden" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
              {packs.map((pack, index) => (
                <button
                  key={pack.id}
                  onClick={() => onPackSelect(index)}
                  className={`relative flex-shrink-0 h-9 flex items-center justify-center rounded-lg border px-3 text-[11px] font-medium transition-all ${index === selectedPackIndex
                    ? 'border-brand-black bg-gray-50 text-brand-black border-2'
                    : 'border-brand-border bg-gray-50 text-brand-black'
                    }`}
                >
                  {pack.name}
                  {pack.isBestSeller && (
                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 rounded bg-red-500 px-1 py-[2px] text-[7px] font-bold text-white shadow-sm uppercase whitespace-nowrap z-10">
                      BEST SELLER
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleOrderNow} disabled={isNavigating} variant="secondary" className="font-poppins font-bold h-10 w-full rounded-full text-xs uppercase tracking-wide whitespace-nowrap">
            {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isNavigating ? 'Processing...' : `Order Now - ${product.currency}${(displayPrice * quantity).toFixed(2)} (Cash On Delivery)`}
          </Button>
        </div>
      </div>
    </>
  );
}
