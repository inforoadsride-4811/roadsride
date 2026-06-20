'use client';

import { useState } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import TrustBadges from '@/components/layout/trust-badges';
import Breadcrumb from '@/components/product/breadcrumb';
import ProductGallery from '@/components/product/product-gallery';
import ProductInfo from '@/components/product/product-info';
import ProductDetails from '@/components/product/product-details';
import CartDrawer from '@/components/cart/cart-drawer';
import { product } from '@/lib/product';

export default function ProductPage() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onCartOpen={() => setCartOpen(true)} />
      {/* bg-[#f5f5f5]  */}
      <main className="pb-[200px] sm:pb-0">
        <div className="bg-[#f5f5f5] pb-10!  ">
          <div className="w-full px-4 sm:px-6" style={{ maxWidth: '1170px', margin: '0 auto' }}>

            <div className="pt-10!">
              <Breadcrumb items={product.breadcrumb} currentPage={product.shortName} />
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
              <div className="order-1 lg:sticky lg:top-24 h-fit z-50">
                <ProductGallery images={product.images} discount={product.discount} />
              </div>

              <div className="order-2 min-w-0">
                <ProductInfo product={product} />
              </div>
            </div>
          </div>
        </div>

        <ProductDetails product={product} />


      </main>

      <div className="mt-16">
        <TrustBadges />
      </div>

      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
