'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProductGallery({ images, discount }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [mounted, setMounted] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);
  const thumbnailsRef = useRef(null);

  const selected = images[selectedIndex];

  const ZOOM_LEVEL = 2.5;
  const lensSize = 100 / ZOOM_LEVEL;
  const lensRadius = lensSize / 2;

  const clampedX = Math.max(lensRadius, Math.min(100 - lensRadius, zoomPos.x));
  const clampedY = Math.max(lensRadius, Math.min(100 - lensRadius, zoomPos.y));

  const handleMouseMove = (e) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const goTo = (direction) => {
    setSelectedIndex((prev) => {
      if (direction === 'prev') return prev === 0 ? images.length - 1 : prev - 1;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  const scrollThumbnails = (direction) => {
    if (thumbnailsRef.current) {
      const scrollAmount = 92; // 80px image + 12px gap
      thumbnailsRef.current.scrollBy({
        top: direction === 'up' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <div className="flex w-full gap-4 items-stretch" style={{ maxWidth: '566px' }}>
        {/* Vertical Thumbnails */}
        <div className="hidden sm:block w-20 shrink-0 relative group">
          <button
            onClick={() => scrollThumbnails('up')}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-10 p-1.5 bg-white/90 backdrop-blur-sm shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white border border-gray-100 cursor-pointer"
            aria-label="Scroll thumbnails up"
          >
            <ChevronUp size={18} className="text-gray-700" />
          </button>

          <div
            ref={thumbnailsRef}
            className="absolute inset-0 flex flex-col gap-3 overflow-y-auto pb-1 [&::-webkit-scrollbar]:hidden scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((img, index) => (
              <button
                key={img.id || index}
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md border-2 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${index === selectedIndex
                  ? 'border-brand-yellow shadow-sm'
                  : 'border-brand-border hover:border-gray-300'
                  }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollThumbnails('down')}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 p-1.5 bg-white/90 backdrop-blur-sm shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white border border-gray-100 cursor-pointer"
            aria-label="Scroll thumbnails down"
          >
            <ChevronDown size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Main Image */}
        <div className="relative w-full" style={{ maxWidth: '470px' }}>
          {/* Discount Badge */}
          {discount && (
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="discount" className="text-sm font-bold px-2.5! py-1!">
                -{discount}%
              </Badge>
            </div>
          )}

          {/* Zoom Icon */}
          <button
            onClick={() => setLightboxOpen(true)}
            aria-label="Zoom Image"
            className="absolute top-4  right-4 z-10 p-2! bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            <ZoomIn size={18} />
          </button>

          {/* Navigation Arrows */}
          <button
            onClick={() => goTo('prev')}
            aria-label="Previous Image"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => goTo('next')}
            aria-label="Next Image"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors cursor-pointer shadow-sm"
          >
            <ChevronRight size={20} />
          </button>

          {/* Image */}
          <div
            ref={imageRef}
            className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white cursor-crosshair p-0!"
            style={{ maxWidth: '470px' }}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setLightboxOpen(true)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full rounded-2xl"
              >
                <Image
                  src={selected.src}
                  alt={selected.alt}
                  fill
                  className="object-contain rounded-2xl"
                  sizes="(max-width: 768px) 100vw, 470px"
                  priority={selectedIndex === 0}
                />
              </motion.div>
            </AnimatePresence>

            {/* Magnifier Lens */}
            {isZooming && (
              <div
                className="hidden lg:block absolute bg-black/10 border border-black/20 pointer-events-none"
                style={{
                  width: `${lensSize}%`,
                  height: `${lensSize}%`,
                  left: `${clampedX - lensRadius}%`,
                  top: `${clampedY - lensRadius}%`,
                }}
              />
            )}
          </div>

          {/* Amazon-style Magnifier Pane */}
          {isZooming && (
            <div
              className="hidden lg:block absolute top-0 z-[100]! bg-white border border-gray-200 shadow-2xl overflow-hidden pointer-events-none"
              style={{
                left: 'calc(100% + 16px)',
                width: '500px',
                height: '500px',
              }}
            >
              <div
                className="relative w-full h-full"
                style={{
                  transform: `scale(${ZOOM_LEVEL}) translate(${50 - clampedX}%, ${50 - clampedY}%)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <Image
                  src={selected.src}
                  alt={selected.alt}
                  fill
                  className="object-contain p-6"
                  sizes="1000px"
                  priority
                />
              </div>
            </div>
          )}

          {/* Mobile Thumbnails (horizontal) */}
          <div className="flex sm:hidden gap-2 mt-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 flex-shrink-0 cursor-pointer ${index === selectedIndex
                  ? 'border-brand-yellow'
                  : 'border-brand-border'
                  }`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {lightboxOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
              onClick={() => setLightboxOpen(false)}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <X size={24} className="text-white" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); goTo('prev'); }}
                className="absolute left-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronLeft size={28} className="text-white" />
              </button>

              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative max-w-4xl max-h-[85vh] w-full aspect-square"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={selected.src}
                  alt={selected.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 80vw"
                />
              </motion.div>

              <button
                onClick={(e) => { e.stopPropagation(); goTo('next'); }}
                className="absolute right-4 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
              >
                <ChevronRight size={28} className="text-white" />
              </button>

              {/* Lightbox Thumbnails */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setSelectedIndex(index); }}
                    className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${index === selectedIndex ? 'bg-white scale-125' : 'bg-white/40'
                      }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
