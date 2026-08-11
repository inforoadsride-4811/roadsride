'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { ChevronLeft } from 'lucide-react';
import useCartStore from '@/store/cart';
import CheckoutForm from '@/components/checkout/checkout-form';
import OrderSummary from '@/components/checkout/order-summary';
import PrepaidBanner from '@/components/checkout/prepaid-banner';
import AnnouncementBar from '@/components/layout/announcement-bar';
import { calculatePrepaidDiscount, SHIPPING_COST } from '@/lib/product';
import { getProducts } from '@/actions/product';

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

  const [recommendations, setRecommendations] = useState([]);
  const [couponState, setCouponState] = useState({ code: '', discount: 0, isValid: false, error: '', loading: false });

  useEffect(() => {
    setMounted(true);
    if (window.location.search.includes('payment=cod')) {
      setIsPrepaid(false);
    }
    
    // Defer recommendation fetch — user needs to fill form first anyway,
    // no need to block the checkout experience with a DB call
    const timer = setTimeout(async () => {
      const res = await getProducts({ limit: 10 });
      if (res.success) {
        setRecommendations(res.products);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async (code, email = null) => {
    if (!code) return;
    
    // Check if already applied
    if (appliedCoupons.some(c => c.code.toUpperCase() === code.toUpperCase())) {
      setCouponError('This coupon is already applied.');
      return;
    }

    setCouponLoading(true);
    setCouponError('');
    try {
      const { validateCoupons } = await import('@/actions/coupon');
      const codesToValidate = [...appliedCoupons.map(c => c.code), code];
      
      const res = await validateCoupons(codesToValidate, items, email);
      if (res.success) {
        setAppliedCoupons(res.coupons);
      } else {
        setCouponError(res.error || 'Failed to apply coupon.');
      }
    } catch (err) {
      setCouponError('Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async (codeToRemove, email = null) => {
    setCouponLoading(true);
    setCouponError('');
    try {
      const remainingCodes = appliedCoupons.filter(c => c.code !== codeToRemove).map(c => c.code);
      if (remainingCodes.length === 0) {
        setAppliedCoupons([]);
        setCouponLoading(false);
        return;
      }
      
      const { validateCoupons } = await import('@/actions/coupon');
      const res = await validateCoupons(remainingCodes, items, email);
      
      if (res.success) {
        setAppliedCoupons(res.coupons);
      } else {
        // If remaining somehow fail validation, clear them or show error
        setAppliedCoupons([]);
        setCouponError(res.error || 'Failed to validate remaining coupons.');
      }
    } catch (err) {
      setCouponError('Error updating coupons');
    } finally {
      setCouponLoading(false);
    }
  };

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
  const totalCouponDiscount = appliedCoupons.reduce((sum, c) => sum + c.discountAmount, 0);
  const afterCouponSubtotal = Math.max(0, subtotal - totalCouponDiscount);
  const prepaidDiscount = isPrepaid ? calculatePrepaidDiscount(afterCouponSubtotal) : 0;
  const total = afterCouponSubtotal + SHIPPING_COST - prepaidDiscount;

  return (
    <div ref={topRef} className="min-h-screen bg-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <ScrollToTop />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Left Column: Form */}
          <div className="flex-1 lg:max-w-2xl">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-black mb-8">Secure Checkout</h1>
            <PrepaidBanner discountAmount={calculatePrepaidDiscount(subtotal)} isPrepaid={isPrepaid} />
            <div className="mt-8">
              <CheckoutForm 
                isPrepaid={isPrepaid} 
                setIsPrepaid={setIsPrepaid} 
                total={total} 
                appliedCoupons={appliedCoupons}
                orderSummary={
                  <OrderSummary
                    items={items}
                    subtotal={subtotal}
                    shipping={SHIPPING_COST}
                    discount={prepaidDiscount}
                    total={total}
                    isPrepaid={isPrepaid}
                    recommendations={recommendations}
                    appliedCoupons={appliedCoupons}
                    couponError={couponError}
                    couponLoading={couponLoading}
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                  />
                }
              />
            </div>
          </div>

          {/* Right Column: Order Summary (Desktop Only) */}
          <div className="hidden lg:block w-full lg:w-[400px] xl:w-[450px]">
            <div className="sticky top-24">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={SHIPPING_COST}
                discount={prepaidDiscount}
                total={total}
                isPrepaid={isPrepaid}
                recommendations={recommendations}
                appliedCoupons={appliedCoupons}
                couponError={couponError}
                couponLoading={couponLoading}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
