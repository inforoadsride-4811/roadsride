'use client';

import { useState } from 'react';

import TrustBadges from '@/components/layout/trust-badges';
import Breadcrumb from '@/components/product/breadcrumb';
import ProductGallery from '@/components/product/product-gallery';
import ProductInfo from '@/components/product/product-info';
import ProductDetails from '@/components/product/product-details';

export default function ProductPageClient({ product }) {
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);

  const packs = product.packs || product.variants || [];
  const currentPack = packs.length > 0 ? packs[selectedPackIndex] : null;
  const displayImages = currentPack?.images?.length > 0 ? currentPack.images : (product.images || []);

  return (
    <div className="bg-white">
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
      </div>
    </div>
  );
}
