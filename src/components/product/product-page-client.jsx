'use client';

import { useState, useEffect, useRef } from 'react';

import TrustBadges from '@/components/layout/trust-badges';
import Breadcrumb from '@/components/product/breadcrumb';
import ProductGallery from '@/components/product/product-gallery';
import ProductInfo from '@/components/product/product-info';
import ProductDetails from '@/components/product/product-details';
import ProductCard from '@/components/shop/ProductCard';

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

export default function ProductPageClient({ product, recommendations = [] }) {
  const [selectedPackIndex, setSelectedPackIndex] = useState(null);
  const topRef = useRef(null);

  const packs = product.packs || product.variants || [];
  const currentPack = (packs.length > 0 && selectedPackIndex !== null) ? packs[selectedPackIndex] : null;
  const displayImages = currentPack?.images?.length > 0 ? currentPack.images : (product.images || []);

  return (
    <div ref={topRef} className="bg-white">
      <ScrollToTop />
      {/* bg-[#f5f5f5]  */}
      <div className="pb-[200px] sm:pb-0">
        <div className="bg-[#f5f5f5] pb-10!  ">
          <div className="w-full px-4 sm:px-6" style={{ maxWidth: '1170px', margin: '0 auto' }}>

            <div className="pt-2!">
              <Breadcrumb items={product.breadcrumb} currentPage={product.shortName} />
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
              <div className="order-1 lg:sticky lg:top-24 h-fit z-20">
                <ProductGallery images={displayImages} discount={product.discount} />
              </div>

              <div className="order-2 min-w-0">
                <ProductInfo
                  product={product}
                  selectedPackIndex={selectedPackIndex}
                  onPackSelect={setSelectedPackIndex}
                />
              </div>
            </div>
          </div>
        </div>
        <ProductDetails product={product} />

        {/* Recommended Products */}
        {recommendations.length > 0 && (
          <div className="w-full px-4 sm:px-6 mt-16 mb-24" style={{ maxWidth: '1400px', margin: '64px auto' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
              {recommendations.map(rec => (
                <ProductCard key={rec.id} product={rec} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
