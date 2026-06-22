import Link from 'next/link';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { formatPrice } from '@/lib/product';
import prisma from '@/lib/db';

export default async function ProductsGrid({ section }) {
  const { title, linkText, linkUrl, productMode, categoryId, manualProducts } = section;

  let products = [];

  if (productMode === 'MANUAL' && manualProducts?.length > 0) {
    products = manualProducts.map(mp => mp.product).slice(0, 4);
  } else if (productMode === 'AUTOMATIC_CATEGORY' && categoryId) {
    products = await prisma.product.findMany({
      where: { categoryId, status: 'active' },
      take: 4,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        reviews: { select: { rating: true } },
        variants: { select: { stock: true, price: true, originalPrice: true }, where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // DEFAULT FALLBACK: Fetch latest active products across all categories
  if (!products || products.length === 0) {
    products = await prisma.product.findMany({
      where: { status: 'active' },
      take: 4,
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        reviews: { select: { rating: true } },
        variants: { select: { stock: true, price: true, originalPrice: true }, where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  if (products.length === 0) {
    return (
      <section className="px-5 md:px-16 mb-16 max-w-[1440px] mx-auto text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
        <p className="text-gray-500 font-medium">No products found in the store yet.</p>
      </section>
    );
  }

  return (
    <section className="px-5 md:px-16 mb-16 max-w-[1440px] mx-auto">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-brand-black">{title}</h2>
        {linkText && linkUrl && (
          <Link href={linkUrl} className="font-semibold text-brand-yellow hover:underline flex items-center">
            {linkText} <span className="ml-1">→</span>
          </Link>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => {
          const mainImage = product.images?.[0]?.src || '/placeholder-product.png';
          
          const displayPrice = product.variants?.length > 0 && product.variants[0].price ? product.variants[0].price : product.price;
          const displayOriginalPrice = product.variants?.length > 0 && product.variants[0].originalPrice ? product.variants[0].originalPrice : product.originalPrice;
          
          const discountPercent = displayOriginalPrice > displayPrice 
            ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) 
            : 0;
                      const reviewCount = product.reviews?.length || 0;
          const avgRating = reviewCount > 0 
            ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
            : 0;
          const effectiveStock = product.variants?.length > 0
            ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
            : product.stock;

          return (
            <div key={product.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col hover:-translate-y-1">
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded z-10">
                    -{discountPercent}%
                  </span>
                )}
                {effectiveStock <= 5 && effectiveStock > 0 && (
                  <span className="absolute top-3 left-3 bg-brand-yellow text-brand-black font-bold text-xs px-2 py-1 rounded z-10">
                    Low Stock
                  </span>
                )}
                {effectiveStock === 0 && (
                  <span className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center font-bold text-lg text-gray-800">
                    Out of Stock
                  </span>
                )}
                
                <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </Link>

                {/* Quick View Overlay (Desktop only) */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-white/90 backdrop-blur flex justify-center hidden md:flex z-10 border-t border-gray-100">
                  <Link href={`/product/${product.slug}`} className="font-bold text-sm text-brand-black flex items-center gap-2 hover:text-brand-yellow">
                    <Eye size={16} /> Quick View
                  </Link>
                </div>
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Math.round(avgRating || 5) ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"} />
                  ))}
                  <span className="text-xs text-gray-500 ml-1">({reviewCount || 'New'})</span>
                </div>
                
                <h3 className="font-medium text-brand-black mb-1 line-clamp-2 min-h-[40px]">
                  <Link href={`/product/${product.slug}`} className="hover:text-brand-yellow transition-colors">
                    {product.name}
                  </Link>
                </h3>
                
                <div className="flex items-baseline gap-2 mb-4 mt-auto">
                  <span className="text-xl font-bold text-brand-black">{formatPrice(displayPrice)}</span>
                  {displayOriginalPrice > displayPrice && (
                    <span className="text-sm text-gray-500 line-through">{formatPrice(displayOriginalPrice)}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
