'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, Shield, Truck, RotateCcw } from 'lucide-react';
import useCartStore from '@/store/cart';
import { Button } from '@/components/ui/button';
import { formatPrice, calculatePrepaidDiscount, SHIPPING_COST } from '@/lib/product';
import TrustBadges from '@/components/layout/trust-badges';

export default function CartPageContent() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getSubtotal, getOriginalSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const originalSubtotal = getOriginalSubtotal();
  const savings = originalSubtotal - subtotal;
  const prepaidDiscount = calculatePrepaidDiscount(subtotal);
  
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-brand-black mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
        <Link href="/">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <h1 className="text-2xl md:text-3xl font-bold text-brand-black mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white border border-brand-border rounded-xl overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-brand-border text-sm font-semibold text-gray-700">
              <div className="col-span-6">Product</div>
              <div className="col-span-3 text-center">Quantity</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="divide-y divide-brand-border">
              {items.map((item) => (
                <div key={item.id} className="p-4 md:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-start md:items-center">
                  <div className="col-span-6 flex gap-4 w-full">
                    <div className="w-20 md:w-24 h-20 md:h-24 relative rounded-lg border border-brand-border bg-gray-50 overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-semibold text-brand-black line-clamp-2">
                        <Link href={`/product/${item.slug}`} className="hover:text-brand-yellow-hover transition-colors">
                          {item.name}
                        </Link>
                      </h3>
                      {item.packName && (
                        <p className="text-xs text-gray-500 mt-1">Number of Items: {item.packName}</p>
                      )}
                      <div className="mt-1 md:hidden">
                        <span className="font-bold text-brand-black">{formatPrice(item.price)}</span>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="mt-auto text-sm text-brand-danger hover:underline w-fit flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-center items-center">
                    <span className="md:hidden text-sm font-medium text-gray-500">Quantity</span>
                    <div className="flex items-center border border-brand-border rounded-lg h-9">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors rounded-l-lg cursor-pointer"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="w-10 h-full flex items-center justify-center text-sm font-semibold text-brand-black border-x border-brand-border">
                        {item.quantity}
                      </div>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-9 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors rounded-r-lg cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="col-span-3 w-full md:w-auto flex justify-between md:justify-end items-center">
                    <span className="md:hidden text-sm font-medium text-gray-500">Total</span>
                    <div className="text-right">
                      <div className="font-bold text-brand-black text-lg">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.originalPrice > item.price && (
                        <div className="text-sm text-gray-400 line-through">
                          {formatPrice(item.originalPrice * item.quantity)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-80 xl:w-96">
          <div className="bg-white border border-brand-border rounded-xl p-6 sticky top-24">
            <h2 className="text-lg font-bold text-brand-black mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-brand-success font-medium">
                <span>Total Savings</span>
                <span>-{formatPrice(savings)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{SHIPPING_COST === 0 ? 'Free' : formatPrice(SHIPPING_COST)}</span>
              </div>
            </div>
            
            <div className="border-t border-brand-border pt-4 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-base font-bold text-brand-black">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-brand-black">{formatPrice(subtotal + SHIPPING_COST)}</span>
                  <p className="text-xs text-gray-500 mt-0.5">Inclusive of all taxes</p>
                </div>
              </div>
            </div>

            {/* Prepaid Banner */}
            <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-3 mb-6 flex items-start gap-3">
              <div className="bg-brand-yellow text-brand-black rounded-full p-1.5 mt-0.5">
                <Shield size={14} />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-black">Save extra {formatPrice(prepaidDiscount)}</p>
                <p className="text-xs text-gray-600 mt-0.5">Pay online via UPI/Card to get 5% discount on checkout.</p>
              </div>
            </div>

            <Button onClick={() => router.push('/checkout')} size="xl" className="w-full text-base">
              Proceed to Checkout
            </Button>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Truck size={16} className="text-gray-400" />
                <span>Free shipping on all prepaid orders</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <RotateCcw size={16} className="text-gray-400" />
                <span>10-day easy return policy</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <Shield size={16} className="text-gray-400" />
                <span>Secure 128-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
