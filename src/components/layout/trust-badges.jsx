'use client';

import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw, Headphones } from 'lucide-react';

const badges = [
  {
    icon: <Truck size={36} />,
    title: 'All India Delivery',
    description: 'We Provide Delivery In All Over India',
  },
  {
    icon: <Shield size={36} />,
    title: 'Secure Payment',
    description: 'Pay with popular and secure payment methods',
  },
  {
    icon: <RotateCcw size={36} />,
    title: '10-day Return Policy',
    description: 'Merchandise must be returned within 10 days.',
  },
  {
    icon: <Headphones size={36} />,
    title: '24/7 Help Center',
    description: "We'll respond to you within 24 hours",
  },
];

export default function TrustBadges() {
  return (
    <section className="border-y border-brand-border ">
      <div className="px-6 py-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex flex-col sm:flex-row min-h-[110px] sm:min-h-28 items-center sm:items-start text-center sm:text-left gap-2 sm:gap-5 rounded-xl bg-white p-3 sm:p-5"
            >
              <div className="text-brand-black flex-shrink-0">
                <div className="scale-75 sm:scale-100 -mb-1 sm:mb-0">{badge.icon}</div>
              </div>
              <div>
                <h3 className="text-[12px] sm:text-base font-bold text-brand-black leading-tight">{badge.title}</h3>
                <p className="text-[10px] sm:text-sm text-gray-500 mt-1 sm:mt-1 leading-snug">{badge.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
