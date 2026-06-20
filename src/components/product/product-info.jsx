'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, Minus, Plus, Truck, ShieldCheck, RotateCcw, MessageCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import useCartStore from '@/store/cart';
import SalesBadge from './sales-badge';

export default function ProductInfo({ product }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const { addToast } = useToast();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => Math.min(prev + 1, product.stock));
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    addToast({
      title: 'Added to cart',
      message: `${quantity} × ${product.shortName} added to your cart.`,
      type: 'success',
    });
  };

  const handleOrderNow = () => {
    setIsNavigating(true);
    addItem(product, quantity);
    router.push('/checkout?payment=cod');
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
        <h1 className="text-2xl font-bold leading-snug text-brand-black lg:text-[26px]">
          {product.name}
        </h1>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 line-through">
            {product.currency}
            {product.originalPrice.toFixed(2)}
          </span>
          <span className="text-base font-semibold leading-none text-brand-black">
            {product.currency}
            {product.price.toFixed(2)}
          </span>
        </div>

        {/* Store Card */}
        <div className="flex w-full items-center gap-4 border border-brand-border bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]" style={{ maxWidth: '380px' }}>
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden border border-brand-border bg-white p-2">
            <Image src="/rr.webp" alt="Store Logo" width={48} height={32} className="w-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Store</p>
            <p className="text-base font-bold text-brand-black">{product.store.name}</p>
          </div>
          <div className="h-10 w-px bg-brand-border"></div>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center text-brand-yellow">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < Math.floor(product.store.rating) ? 'currentColor' : 'none'}
                  className={i < Math.floor(product.store.rating) ? '' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="mt-1 text-xs font-semibold text-gray-700">
              {product.store.rating} ({product.store.reviewCount} Reviews)
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

        {/* Stock */}
        <p className="inline-flex items-center gap-2 text-sm text-brand-black">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-success"></span>
          {product.stock} in stock
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Quantity selector */}
            <div className="flex h-14 w-full items-center rounded-xl border border-brand-border sm:w-[150px]">
              <button
                onClick={() => handleQuantityChange('dec')}
                className="flex h-full w-14 items-center justify-center rounded-l-xl text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <div className="flex h-full flex-1 items-center justify-center border-x border-brand-border text-base font-semibold text-brand-black">
                {quantity}
              </div>
              <button
                onClick={() => handleQuantityChange('inc')}
                className="flex h-full w-14 items-center justify-center rounded-r-xl text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-1">
              <Button onClick={handleAddToCart} size="lg" className="h-14 w-full rounded-full text-sm uppercase tracking-wide whitespace-nowrap">
                Add To Cart
              </Button>
            </div>
          </div>
          <Button onClick={handleOrderNow} disabled={isNavigating} variant="secondary" size="lg" className="h-14 w-full rounded-full text-sm uppercase tracking-wide whitespace-nowrap ">
            {isNavigating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isNavigating ? 'Processing...' : 'Order Now - Cash On Delivery'}
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
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-brand-border p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] pb-safe">
        <div className="flex flex-col gap-2.5">
          <div className="flex h-12 w-full items-center rounded-xl border border-brand-border bg-gray-50/50">
            <button onClick={() => handleQuantityChange('dec')} className="flex h-full w-14 items-center justify-center rounded-l-xl text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200">
              <Minus size={16} />
            </button>
            <div className="flex h-full flex-1 items-center justify-center border-x border-brand-border text-base font-semibold text-brand-black">
              {quantity}
            </div>
            <button onClick={() => handleQuantityChange('inc')} className="flex h-full w-14 items-center justify-center rounded-r-xl text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200">
              <Plus size={16} />
            </button>
          </div>
          <Button onClick={handleAddToCart} size="lg" className="h-12 w-full rounded-xl text-sm uppercase tracking-wide whitespace-nowrap">
            Add To Cart
          </Button>
          <Button onClick={handleOrderNow} disabled={isNavigating} variant="secondary" size="lg" className="h-12 w-full rounded-full text-sm uppercase tracking-wide whitespace-nowrap">
            {isNavigating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isNavigating ? 'Processing...' : 'Order Now - Cash On Delivery'}
          </Button>
        </div>
      </div>
    </>
  );
}
