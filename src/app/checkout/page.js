'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import useCartStore from '@/store/cart';
import CheckoutForm from '@/components/checkout/checkout-form';
import OrderSummary from '@/components/checkout/order-summary';
import PrepaidBanner from '@/components/checkout/prepaid-banner';
import AnnouncementBar from '@/components/layout/announcement-bar';
import { calculatePrepaidDiscount, SHIPPING_COST } from '@/lib/product';

function ScrollToTop() {
  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    resetScroll();
    const t1 = setTimeout(resetScroll, 50);
    const t2 = setTimeout(resetScroll, 150);
    const t3 = setTimeout(resetScroll, 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);
  return null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isPrepaid, setIsPrepaid] = useState(true);
  const topRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    if (window.location.search.includes('payment=cod')) {
      setIsPrepaid(false);
    }
  }, []);

  if (!mounted) {
    return (
      <div ref={topRef} className="min-h-screen bg-white">
        <ScrollToTop />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 animate-pulse">
            <div className="flex-1 lg:max-w-2xl">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="h-24 bg-gray-100 rounded-xl mb-8 border border-gray-200"></div>
              <div className="space-y-6">
                <div className="h-40 bg-gray-50 rounded-xl border border-gray-200"></div>
                <div className="h-60 bg-gray-50 rounded-xl border border-gray-200"></div>
                <div className="h-32 bg-gray-50 rounded-xl border border-gray-200"></div>
              </div>
            </div>
            <div className="w-full lg:w-[400px] xl:w-[450px]">
              <div className="h-[400px] bg-gray-50 rounded-xl border border-gray-200"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const prepaidDiscount = isPrepaid ? calculatePrepaidDiscount(subtotal) : 0;
  const total = subtotal + SHIPPING_COST - prepaidDiscount;

  return (
    <div ref={topRef} className="min-h-screen bg-white">
      <ScrollToTop />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left Column: Form */}
          <div className="flex-1 lg:max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-black mb-8">Secure Checkout</h1>
            <PrepaidBanner discountAmount={calculatePrepaidDiscount(subtotal)} isPrepaid={isPrepaid} />
            <div className="mt-8">
              <CheckoutForm isPrepaid={isPrepaid} setIsPrepaid={setIsPrepaid} total={total} />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="w-full lg:w-[400px] xl:w-[450px]">
            <div className="sticky top-24">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={SHIPPING_COST}
                discount={prepaidDiscount}
                total={total}
                isPrepaid={isPrepaid}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
