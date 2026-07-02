'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import CartDrawer from '../cart/cart-drawer';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

export default function ClientLayout({ children, settings }) {
  const [cartOpen, setCartOpen] = useState(false);
  const pathname = usePathname() || '';
  const isAdminRoute = pathname.startsWith('/admin');
  const isAccountRoute = pathname.startsWith('/account');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ProgressBar
        height="3px"
        color="#fbbf24" // Tailwind amber-400 or brand yellow
        options={{ showSpinner: false }}
        shallowRouting
      />
      {!isAdminRoute && <Header onCartOpen={() => setCartOpen(true)} settings={settings} />}
      <main className="flex-1">
        {children}
      </main>
      {!isAdminRoute && !isAccountRoute && <Footer />}
      {!isAdminRoute && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />}
    </div>
  );
}
