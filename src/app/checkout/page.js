'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft } from 'lucide-react';
import useCartStore from '@/store/cart';
import CheckoutForm from '@/components/checkout/checkout-form';
import OrderSummary from '@/components/checkout/order-summary';
import PrepaidBanner from '@/components/checkout/prepaid-banner';
import { calculatePrepaidDiscount, SHIPPING_COST } from '@/lib/product';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isPrepaid, setIsPrepaid] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (window.location.search.includes('payment=cod')) {
      setIsPrepaid(false);
    }
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  const subtotal = getSubtotal();
  const prepaidDiscount = isPrepaid ? calculatePrepaidDiscount(subtotal) : 0;
  const total = subtotal + SHIPPING_COST - prepaidDiscount;

  return (
    <div className="min-h-screen bg-white">
      {/* Checkout Header */}
      <header className="border-b border-brand-border bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/cart" className="text-gray-500 hover:text-brand-black flex items-center gap-1 text-sm font-medium transition-colors">
            <ChevronLeft size={18} />
            Back to Cart
          </Link>
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/rr.webp"
              alt="RoadsRide"
              width={120}
              height={30}
              className="h-8 w-auto"
            />
          </Link>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left Column: Form */}
          <div className="flex-1 lg:max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-black mb-8">Secure Checkout</h1>
            <PrepaidBanner discountAmount={calculatePrepaidDiscount(subtotal)} />
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
