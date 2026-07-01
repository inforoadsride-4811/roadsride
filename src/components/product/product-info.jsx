'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, StarHalf, Minus, Plus, Truck, ShieldCheck, RotateCcw, MessageCircle, Loader2, CheckCircle2, ChevronUp, X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import useCartStore from '@/store/cart';
import SalesBadge from './sales-badge';

export default function ProductInfo({ product, selectedPackIndex = 0, onPackSelect = () => { } }) {
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const { addToast } = useToast();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const packs = product.packs || product.variants || [];
  const currentPack = packs.length > 0 ? packs[selectedPackIndex] : null;
  const displayPrice = currentPack?.price || product.price;
  const displayOriginalPrice = currentPack?.originalPrice || product.originalPrice;
  const effectiveStock = currentPack ? (currentPack.stock || 0) : (product.variants?.length > 0 ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0) : product.stock);
  const displayImages = currentPack?.images?.length > 0 ? currentPack.images : (product.images || []);
  const store = product.store || { name: 'RoadsRide' };

  const reviews = product.reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount
    : 5;
  const roundedRating = Math.round(averageRating);

  const handleQuantityChange = (type) => {
    if (type === 'inc') {
      setQuantity((prev) => Math.min(prev + 1, product.stock));
    } else {
      setQuantity((prev) => Math.max(prev - 1, 1));
    }
  };

  const getPackProduct = () => ({
    ...product,
    id: currentPack?.id || product.id,
    name: product.name,
    packName: currentPack?.name || '',
    price: displayPrice,
    originalPrice: displayOriginalPrice,
    images: displayImages,
    keyPoints: currentPack?.keyPoints || product.keyPoints || [],
    badgeText: currentPack?.badgeText || '',
    savingsText: currentPack?.savingsText || '',
    packIndex: selectedPackIndex
  });

  const handleAddToCart = () => {
    const packProduct = getPackProduct();
    addItem(packProduct, quantity);
    addToast({
      title: 'Added to cart',
      message: `${quantity} × ${packProduct.name} added to your cart.`,
      type: 'success',
    });
  };

  const handleOrderNow = () => {
    setIsNavigating(true);
    clearCart(); // Clear the cart so only this item is checked out
    addItem(getPackProduct(), quantity);
    router.push('/checkout?payment=Cash On Delivery');
  };

  const trustItems = [
    { icon: Truck, label: 'All India Delivery' },
    { icon: ShieldCheck, label: 'Secure Payment' },
    { icon: RotateCcw, label: '10 Day Returns' },
    { icon: MessageCircle, label: '24/7 Support' },
  ];

  return (
    <>
      <div className="flex w-full flex-col gap-5 lg:pt-1" style={{ maxWidth: '570px' }}>
        {/* Title */}
        <h1 className="font-poppins font-bold text-2xl leading-snug text-brand-black lg:text-[26px]">
          {product.name}
        </h1>

        {/* Rating and Stock */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
              window.dispatchEvent(new CustomEvent('open-reviews-tab'));
            }}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center text-brand-yellow">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill={i < roundedRating ? 'currentColor' : 'none'}
                  className={i < roundedRating ? '' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-500">
              ({reviewCount} customer review{reviewCount !== 1 ? 's' : ''})
            </span>
          </button>

          <div className="flex items-center gap-1.5 text-brand-black">
            {effectiveStock > 0 ? (
              <>
                <CheckCircle2 size={16} className="text-green-600" />
                <span className="text-sm font-bold text-green-700">In stock</span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-red-600">Out of stock</span>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          {displayOriginalPrice > displayPrice && (
            <span className="font-montserrat font-bold text-sm text-gray-500 line-through">
              {product.currency}
              {displayOriginalPrice.toFixed(2)}
            </span>
          )}
          <span className="font-montserrat text-xl font-bold leading-none text-brand-black">
            {product.currency}
            {displayPrice.toFixed(2)}
          </span>
        </div>

        {/* Store Card */}
        <div className="flex w-full items-center gap-4 border border-brand-border bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]" style={{ maxWidth: '380px' }}>
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden border border-brand-border bg-white p-1">
            <Image src={displayImages[0]?.src || '/placeholder.png'} alt="Product Thumbnail" width={48} height={48} className="w-full h-full object-cover rounded-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500 font-medium">Store</p>
            <p className="text-base font-bold text-brand-black">{store.name}</p>
          </div>
          <div className="h-10 w-px bg-brand-border"></div>
          <div className="flex min-w-0 flex-col justify-center">
            <div className="flex items-center gap-0.5 text-brand-yellow">
              {[...Array(4)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  fill="currentColor"
                  className="text-brand-yellow"
                />
              ))}
              <div className="relative w-4 h-4">
                <Star size={16} className="text-brand-yellow absolute inset-0" fill="transparent" />
                <StarHalf size={16} className="text-brand-yellow absolute inset-0" fill="currentColor" />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-1">
              4.7 rating (114 reviews)
            </p>
          </div>
        </div>

        {/* Sales Badge */}
        <SalesBadge count={product.soldCount} period={product.soldPeriod} />

        {/* Features */}
        <ul className="space-y-3">
          {product.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-gray-700">
              <div className="flex h-[22.75px] items-center flex-shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-black"></span>
              </div>
              <span className="min-w-0">
                <span className="font-bold text-brand-black">{feature.bold}</span> {feature.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Removed Stock Indicator from here */}

        {/* Packs Variation */}
        {packs.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-brand-black uppercase">Number of Items</p>
            
            {/* All Devices: Rich Cards */}
            <div className="flex flex-col space-y-4 mt-2">
              {packs.map((pack, index) => {
                const isSelected = index === selectedPackIndex;
                let borderColor = isSelected ? 'border-brand-black' : 'border-gray-300';
                let bgColor = isSelected ? 'bg-green-50/30' : 'bg-white';
                let badgeBg = 'bg-gray-100 text-gray-700';

                if (index === 1) { borderColor = isSelected ? 'border-green-600' : 'border-green-300'; badgeBg = 'bg-green-100 text-green-800'; }
                if (index === 2) { borderColor = isSelected ? 'border-blue-600' : 'border-blue-300'; badgeBg = 'bg-blue-100 text-blue-800'; }
                if (index === 3) { borderColor = isSelected ? 'border-orange-600' : 'border-orange-300'; badgeBg = 'bg-orange-100 text-orange-800'; }

                return (
                  <div 
                    key={`desktop-${pack.id}`} 
                    onClick={() => onPackSelect(index)}
                    className={`relative flex flex-col rounded-xl border-2 ${borderColor} ${bgColor} overflow-hidden cursor-pointer transition-colors shadow-sm`}
                  >
                    {pack.badgeText && (
                      <div className={`w-full py-1.5 px-3 text-center text-[11px] font-black tracking-wide uppercase ${badgeBg}`}>
                        {pack.badgeText}
                      </div>
                    )}
                    
                    <div className="p-4 flex gap-3">
                      <div className="pt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-green-600' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-brand-black text-base leading-tight">
                            {pack.name}
                          </h4>
                          <div className="text-right">
                            {pack.savingsText && (
                              <p className="text-[10px] text-gray-500 font-semibold">{pack.savingsText}</p>
                            )}
                            <p className="font-black text-lg text-brand-black leading-none">
                              {product.currency}{pack.price}
                            </p>
                          </div>
                        </div>
                        
                        {pack.keyPoints && pack.keyPoints.length > 0 && (
                          <ul className="mt-2 space-y-1.5">
                            {pack.keyPoints.map((point, i) => (
                              <li key={i} className="text-xs font-semibold text-gray-800 flex items-start leading-tight">
                                <span className="mr-1.5 shrink-0">
                                  {point.includes('GIFT') || point.includes('🎁') ? '🎁' : (point.includes('❌') ? '❌' : '•')}
                                </span>
                                <span>{point.replace(/🎁|❌/, '').trim()}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}

        <div className="flex flex-col gap-3 pt-1">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Quantity selector */}
            <div className="flex h-14 w-full items-center rounded-xl border border-brand-border sm:w-[150px]">
              <button
                onClick={() => handleQuantityChange('dec')}
                aria-label="Decrease quantity"
                className="flex h-full w-14 items-center justify-center rounded-l-xl text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Minus size={16} />
              </button>
              <div className="flex h-full flex-1 items-center justify-center border-x border-brand-border text-base font-semibold text-brand-black">
                {quantity}
              </div>
              <button
                onClick={() => handleQuantityChange('inc')}
                aria-label="Increase quantity"
                className="flex h-full w-14 items-center justify-center rounded-r-xl text-gray-600 transition-colors hover:bg-gray-50 cursor-pointer"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Buttons */}
            <div className="flex flex-1">
              <Button onClick={handleAddToCart} size="lg" className="font-poppins font-bold h-14 w-full rounded-full text-sm uppercase tracking-wide whitespace-nowrap">
                Add To Cart
              </Button>
            </div>
          </div>
          <Button onClick={handleOrderNow} disabled={isNavigating} variant="secondary" size="lg" className="font-poppins font-bold h-14 w-full rounded-full text-sm uppercase tracking-wide whitespace-nowrap ">
            {isNavigating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {isNavigating ? 'Processing...' : `Order Now - ${product.currency}${(displayPrice * quantity).toFixed(2)} (Cash On Delivery)`}
          </Button>

          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-brand-border bg-white px-3 py-4 text-center">
                <Icon size={22} className="text-brand-black" />
                <span className="text-xs font-bold leading-snug text-brand-black">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Actions */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-brand-border p-3 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] pb-safe">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 justify-between items-center">
            {packs.length > 0 ? (
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex flex-1 h-11 items-center justify-between rounded-xl border-2 border-brand-black bg-white px-4 text-sm font-bold text-brand-black"
              >
                <span className="truncate mr-2">{currentPack?.name || 'Choose Pack'}</span>
                <ChevronUp size={18} />
              </button>
            ) : (
              <div className="flex-1" />
            )}
            
            <div className="flex h-11 w-[120px] items-center rounded-xl border border-brand-border bg-gray-50 flex-shrink-0">
              <button aria-label="Decrease quantity" onClick={() => handleQuantityChange('dec')} className="flex h-full w-10 items-center justify-center rounded-l-xl text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200">
                <Minus size={16} />
              </button>
              <div className="flex h-full flex-1 items-center justify-center border-x border-brand-border text-base font-bold text-brand-black">
                {quantity}
              </div>
              <button aria-label="Increase quantity" onClick={() => handleQuantityChange('inc')} className="flex h-full w-10 items-center justify-center rounded-r-xl text-gray-600 transition-colors hover:bg-gray-100 active:bg-gray-200">
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          <Button onClick={handleOrderNow} disabled={isNavigating} variant="secondary" className="font-poppins font-bold h-12 w-full rounded-full text-[13px] uppercase tracking-wide">
            {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isNavigating ? 'Processing...' : `Order Now - ${product.currency}${(displayPrice * quantity).toFixed(2)} (Cash On Delivery)`}
          </Button>
        </div>
      </div>

      {/* Full-Screen Pack Selection Drawer */}
      {isDrawerOpen && packs.length > 0 && (
        <div className="fixed inset-0 z-[200] flex flex-col bg-white overflow-hidden sm:hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-brand-border bg-white shrink-0 sticky top-0 z-10">
            <h2 className="text-lg font-bold text-brand-black">Choose Your Pack</h2>
            <button onClick={() => setIsDrawerOpen(false)} className="p-2 -mr-2 text-gray-500">
              <X size={24} />
            </button>
          </div>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4 pb-32">
            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-brand-black uppercase leading-tight">
                Choose Your Pack &<br/>Secure Big Savings 👇
              </h3>
              <p className="text-xs text-gray-600 mt-2 italic">
                (Cash on Delivery (COD) & FREE Delivery Available on All Orders) 🚚
              </p>
            </div>

            <div className="space-y-4">
              {packs.map((pack, index) => {
                const isSelected = index === selectedPackIndex;
                let borderColor = isSelected ? 'border-brand-black' : 'border-gray-300';
                let bgColor = isSelected ? 'bg-green-50/30' : 'bg-white';
                let badgeBg = 'bg-gray-100 text-gray-700';

                // Basic logic for colors based on index if not explicitly styled
                if (index === 1) { borderColor = isSelected ? 'border-green-600' : 'border-green-300'; badgeBg = 'bg-green-100 text-green-800'; }
                if (index === 2) { borderColor = isSelected ? 'border-blue-600' : 'border-blue-300'; badgeBg = 'bg-blue-100 text-blue-800'; }
                if (index === 3) { borderColor = isSelected ? 'border-orange-600' : 'border-orange-300'; badgeBg = 'bg-orange-100 text-orange-800'; }

                return (
                  <div 
                    key={pack.id} 
                    onClick={() => { onPackSelect(index); setIsDrawerOpen(false); }}
                    className={`relative flex flex-col rounded-xl border-2 ${borderColor} ${bgColor} overflow-hidden cursor-pointer transition-colors shadow-sm`}
                  >
                    {pack.badgeText && (
                      <div className={`w-full py-1.5 px-3 text-center text-[11px] font-black tracking-wide uppercase ${badgeBg}`}>
                        {pack.badgeText}
                      </div>
                    )}
                    
                    <div className="p-4 flex gap-3">
                      <div className="pt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-green-600' : 'border-gray-300'}`}>
                          {isSelected && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-brand-black text-base leading-tight">
                            {pack.name}
                          </h4>
                          <div className="text-right">
                            {pack.savingsText && (
                              <p className="text-[10px] text-gray-500 font-semibold">{pack.savingsText}</p>
                            )}
                            <p className="font-black text-lg text-brand-black leading-none">
                              {product.currency}{pack.price}
                            </p>
                          </div>
                        </div>
                        
                        {pack.keyPoints && pack.keyPoints.length > 0 && (
                          <ul className="mt-2 space-y-1.5">
                            {pack.keyPoints.map((point, i) => (
                              <li key={i} className="text-xs font-semibold text-gray-800 flex items-start leading-tight">
                                <span className="mr-1.5 shrink-0">
                                  {point.includes('GIFT') || point.includes('🎁') ? '🎁' : (point.includes('❌') ? '❌' : '•')}
                                </span>
                                <span className="pt-[1px]">{point.replace(/^(🎁|❌|•|\s)+/, '')}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Footer Action */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shrink-0 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <Button onClick={() => { setIsDrawerOpen(false); handleOrderNow(); }} disabled={isNavigating} variant="secondary" className="w-full h-14 bg-[#2e8b3b] hover:bg-[#257330] text-white rounded-lg font-black text-sm uppercase shadow-[0_4px_14px_rgba(46,139,59,0.4)] border-none">
              {isNavigating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
              {isNavigating ? 'Processing...' : `BUY NOW - ${product.currency}${currentPack?.price} (FREE GIFT UNLOCKED!) 🎁`}
            </Button>
            <p className="text-center text-[10px] font-bold text-gray-500 mt-3 uppercase tracking-wide">
              CLICK NOW → Check out Form (No Extra Step)
            </p>
          </div>
        </div>
      )}
    </>
  );
}
