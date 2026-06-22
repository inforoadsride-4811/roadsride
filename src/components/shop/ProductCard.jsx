'use client';

import Link from 'next/link';
import { Eye, Heart, ShoppingCart, Star, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/product';
import useCartStore from '@/store/cart';
import { useToast } from '@/components/ui/toast';
import { useRouter } from 'next/navigation';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const { addItem } = useCartStore();
  const { addToast } = useToast();
  const router = useRouter();

  const mainImage = product.images?.[0]?.src || '/placeholder-product.png';
  const hoverImage = product.images?.[1]?.src || mainImage;
  
  const displayPrice = product.variants?.length > 0 ? product.variants[0].price : product.price;
  const displayOriginalPrice = product.variants?.length > 0 ? product.variants[0].originalPrice : product.originalPrice;
  
  const discountPercent = displayOriginalPrice > displayPrice 
    ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100) 
    : 0;
  
  const savings = displayOriginalPrice - displayPrice;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      image: mainImage,
      slug: product.slug,
      stock: product.stock,
      quantity: 1
    });
    
    addToast({
      title: 'Added to Cart',
      message: `${product.name} has been added to your cart.`,
      type: 'success',
    });
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleAddToCart(e);
    router.push('/checkout');
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 group flex flex-col sm:flex-row hover:-translate-y-1">
        <div className="relative w-full sm:w-64 h-64 sm:h-auto bg-gray-50 overflow-hidden shrink-0">
          {discountPercent > 0 && (
            <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded z-10">
              -{discountPercent}%
            </span>
          )}
          
          <Link href={`/product/${product.slug}`} className="absolute inset-0 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </Link>
          
          <button className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-gray-400 hover:text-red-500 transition-colors z-10 opacity-0 group-hover:opacity-100 shadow-sm translate-x-4 group-hover:translate-x-0 duration-300">
            <Heart size={18} />
          </button>
        </div>
        
        <div className="p-6 flex flex-col flex-grow justify-center">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < Math.round(product.avgRating || 5) ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"} />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 'New'})</span>
          </div>
          
          <h3 className="text-xl font-medium text-brand-black mb-2">
            <Link href={`/product/${product.slug}`} className="hover:text-brand-yellow transition-colors">
              {product.name}
            </Link>
          </h3>
          
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description?.replace(/<[^>]+>/g, '') || 'Premium quality automotive accessory.'}</p>
          
          <div className="flex items-end gap-3 mb-4">
            <span className="text-2xl font-bold text-brand-black">{formatPrice(displayPrice)}</span>
            {displayOriginalPrice > displayPrice && (
              <>
                <span className="text-sm text-gray-400 line-through mb-1">{formatPrice(displayOriginalPrice)}</span>
                <span className="text-xs text-green-600 font-semibold mb-1">Save {formatPrice(savings)}</span>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-3 mt-auto">
            <button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1 bg-white border-2 border-brand-black text-brand-black hover:bg-gray-50 font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart size={18} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="flex-1 bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Zap size={18} /> Buy Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col hover:-translate-y-1">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-xs px-2 py-1 rounded z-10">
            -{discountPercent}%
          </span>
        )}
        
        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute top-3 left-3 bg-brand-yellow text-brand-black font-bold text-xs px-2 py-1 rounded z-10">
            Low Stock
          </span>
        )}
        
        {product.stock === 0 && (
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
            <Star key={i} size={14} className={i < Math.round(product.avgRating || 5) ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"} />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 'New'})</span>
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
}
