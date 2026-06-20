'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import useCartStore from '@/store/cart';
import Image from 'next/image';
import { formatPrice } from '@/lib/product';

export default function CartDrawer({ open, onClose }) {
  const { items, updateQuantity, removeItem, getSubtotal } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <Sheet open={open} onClose={onClose} side="right" title="Your Cart">
      <div className="flex flex-col h-full">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-brand-black mb-2">Your cart is empty</h3>
            <p className="text-sm text-gray-500 mb-6">
              Looks like you haven&apos;t added any items yet.
            </p>
            <Button onClick={onClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 bg-white p-3 border border-brand-border rounded-xl">
                  {/* Image */}
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-brand-border">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h4 className="text-sm font-semibold text-brand-black line-clamp-2">
                          {item.name}
                        </h4>
                        {item.packName && (
                          <p className="text-xs text-gray-500 mt-1">Number of Items: {item.packName}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-gray-400 hover:text-brand-danger transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-bold text-brand-black">
                        {formatPrice(item.price)}
                      </span>
                      {item.originalPrice > item.price && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-brand-border rounded-lg h-8">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors rounded-l-lg cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <div className="w-8 h-full flex items-center justify-center text-xs font-semibold text-brand-black border-x border-brand-border">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-full flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors rounded-r-lg cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-brand-border p-4 bg-gray-50 mt-auto">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-lg font-bold text-brand-black">
                  {formatPrice(getSubtotal())}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-4 text-center">
                Shipping, taxes, and discounts calculated at checkout.
              </p>
              <Button onClick={handleCheckout} className="w-full mb-2">Checkout</Button>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
