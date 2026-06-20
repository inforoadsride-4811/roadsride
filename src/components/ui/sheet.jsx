'use client';

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Sheet({ open, onClose, side = 'right', title, children, className = '' }) {
  const handleEscape = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [open, handleEscape]);

  const slideVariants = {
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
  };

  const variant = slideVariants[side];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-[200]"
            onClick={onClose}
          />
          <motion.div
            initial={variant.initial}
            animate={variant.animate}
            exit={variant.exit}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed top-0 ${side}-0 h-full bg-white shadow-2xl z-[200] flex flex-col ${className}`}
            style={{ width: 'min(400px, 85vw)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
              <h2 className="text-lg font-semibold text-brand-black">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
