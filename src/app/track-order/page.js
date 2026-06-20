'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import TrackingForm from '@/components/tracking/tracking-form';
import TrackingResult from '@/components/tracking/tracking-result';
import CartDrawer from '@/components/cart/cart-drawer';

export default function TrackOrderPage() {
  const [order, setOrder] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <TrackingForm onResult={setOrder} />
        <TrackingResult order={order} />
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
