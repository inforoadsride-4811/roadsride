'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function SalesBadge({ period = '24 hours' }) {
  const [salesCount, setSalesCount] = useState(null);

  useEffect(() => {
    const seen = JSON.parse(localStorage.getItem('seen_sales_counts') || '[]');
    let randomCount;
    // Generate a number between 201 and 350
    do {
      randomCount = Math.floor(Math.random() * 150) + 201;
    } while (seen.includes(randomCount) && seen.length < 150);

    seen.push(randomCount);
    if (seen.length > 150) seen.shift(); // Bound the array size
    localStorage.setItem('seen_sales_counts', JSON.stringify(seen));

    setSalesCount(randomCount);
  }, []);

  if (!salesCount) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden inline-flex items-center max-w-2xl! w-fit gap-2 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-full px-4! py-2! shadow-sm"
    >
      {/* Shiny Sweeping Effect */}
      <motion.div
        className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/80 to-transparent -skew-x-12 w-[150%]"
        animate={{ x: ['-150%', '150%'] }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'linear',
          repeatDelay: 3
        }}
      />

      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          rotate: [0, -5, 5, -5, 0],
        }}
        transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
        className="relative z-10 drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]"
      >
        <Flame size={18} className="text-red-500 fill-orange-500" />
      </motion.div>

      <span className="relative z-10 text-sm font-medium text-orange-900">
        <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 text-base">
          {salesCount}
        </span>{' '}
        sold in last {period}
      </span>
    </motion.div>
  );
}
