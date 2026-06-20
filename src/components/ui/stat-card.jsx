'use client';

import { motion } from 'framer-motion';

export function StatCard({ title, value, icon, trend, trendLabel, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-brand-border rounded-xl p-5 ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-brand-black mt-1">{value}</p>
          {trendLabel && (
            <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-brand-success' : 'text-brand-danger'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 bg-brand-yellow/10 rounded-lg text-brand-yellow">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
