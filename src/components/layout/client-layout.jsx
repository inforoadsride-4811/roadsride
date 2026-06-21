'use client';

import { useState } from 'react';
import Header from './header';
import Footer from './footer';
import CartDrawer from '../cart/cart-drawer';

export default function ClientLayout({ children }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onCartOpen={() => setCartOpen(true)} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
