'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSection({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    
    const interval = setInterval(() => {
      setActiveIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <section className="w-full relative mb-16">
        <div className="w-full h-[40vh] md:h-[60vh] min-h-[300px] border-b border-gray-200 flex items-center justify-center bg-gray-50">
          <p className="text-gray-500 font-medium">No Hero Banner Images Available</p>
        </div>
      </section>
    );
  }

  const handleNext = () => {
    setActiveIndex((current) => (current === slides.length - 1 ? 0 : current + 1));
  };

  const handlePrev = () => {
    setActiveIndex((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  return (
    <section className="w-full relative mb-10 md:mb-16 bg-black">
      <div className="relative w-full h-[500px] md:h-[55vh] md:max-h-[600px] overflow-hidden group">
        
        {/* Carousel Slides */}
        <div 
          className="flex w-full h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {slides.map((section, idx) => (
            <div key={section.id || idx} className="w-full h-full flex-shrink-0 relative">
              {section.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[2000ms] ${activeIndex === idx ? 'scale-105 group-hover:scale-110' : 'scale-100'} cursor-pointer`} 
                  alt={section.title || "Hero Image"} 
                  src={section.imageUrl} 
                />
              )}
              <div className={`absolute inset-0 flex items-center pointer-events-none ${(section.title || section.subtitle || section.badge || section.linkText) ? 'bg-gradient-to-r from-black/80 via-black/40 to-transparent' : ''}`}>
                <div className="px-5 md:px-16 max-w-[1440px] mx-auto w-full transition-opacity duration-1000 delay-300 pointer-events-auto">
                  <div className="max-w-2xl">
                    {section.badge && (
                    <span className="inline-block px-3 py-1 bg-brand-yellow text-brand-black text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
                      {section.badge}
                    </span>
                  )}
                  
                  {section.title && (
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                      {section.title}
                    </h1>
                  )}
                  
                  {section.subtitle && (
                    <p className="text-lg text-gray-200 mb-8 max-w-lg">
                      {section.subtitle}
                    </p>
                  )}
                  
                  {section.linkText && section.linkUrl && (
                    <Link href={section.linkUrl} className="inline-block bg-brand-yellow hover:bg-brand-yellow-hover text-brand-black font-bold px-8 py-4 rounded-lg transition-all duration-300 shadow-lg hover:-translate-y-1">
                      {section.linkText}
                    </Link>
                  )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows (only if multiple slides) */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={24} />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeIndex === idx ? 'bg-brand-yellow w-8' : 'bg-white/50 hover:bg-white'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
