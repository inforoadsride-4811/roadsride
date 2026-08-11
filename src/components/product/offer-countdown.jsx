'use client';

import { useState, useEffect } from 'react';

// Themes mapping
const themes = {
  'gradient-fire': 'bg-gradient-to-r from-red-500 to-orange-500 text-white',
  'gradient-ocean': 'bg-gradient-to-r from-blue-600 to-teal-400 text-white',
  'gradient-midnight': 'bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 text-white',
  'gradient-forest': 'bg-gradient-to-r from-emerald-600 to-green-400 text-white',
  'solid-black': 'bg-black text-white',
  'brand-yellow': 'bg-brand-yellow text-brand-black',
};

export default function OfferCountdown({ offer }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!offer || !offer.isActive) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startDate = new Date(offer.startDate).getTime();
      const endDate = new Date(offer.endDate).getTime();

      if (now < startDate) {
        setIsStarted(false);
        return;
      }
      setIsStarted(true);

      if (now >= endDate) {
        setIsExpired(true);
        return;
      }

      const difference = endDate - now;
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [offer]);

  if (!mounted || !offer || !offer.isActive || !isStarted) return null;

  const themeClass = themes[offer.bgTheme] || themes['gradient-fire'];

  if (isExpired && !offer.expiredMessage) {
    return null;
  }

  return (
    <div className={`rounded-md overflow-hidden shadow-sm mb-6 ${themeClass}`}>
      <div className="relative px-3 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-3">
        
        {/* Content Side */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 z-10 flex-1">
          {offer.badgeText && (
            <span className="inline-flex items-center px-2 py-0.5 bg-black/20 text-white rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border border-white/10">
              {offer.badgeText}
            </span>
          )}
          <span className="text-sm sm:text-base font-bold">
            {offer.title}
          </span>
          {offer.subtitle && (
            <span className="text-xs sm:text-sm opacity-90 font-medium">
              • {offer.subtitle}
            </span>
          )}
        </div>

        {/* Timer or Expired Message Side */}
        {isExpired ? (
          <div className="flex items-center gap-2 z-10 shrink-0 bg-black/10 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90">{offer.expiredMessage}</span>
          </div>
        ) : offer.showCountdown ? (
          <div className="flex items-center gap-2 z-10 shrink-0 bg-black/10 px-2 py-1 rounded border border-white/10 backdrop-blur-sm">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider opacity-90">Ends in:</span>
            <div className="flex items-center font-mono text-sm sm:text-sm font-bold tracking-tight">
              {timeLeft.days > 0 && <span>{timeLeft.days}d&nbsp;</span>}
              <span>{timeLeft.hours.toString().padStart(2, '0')}h&nbsp;</span>
              <span>{timeLeft.minutes.toString().padStart(2, '0')}m&nbsp;</span>
              <span>{timeLeft.seconds.toString().padStart(2, '0')}s</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
