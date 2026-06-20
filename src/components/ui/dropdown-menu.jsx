'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export function DropdownMenu({ trigger, items = [], align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {trigger || (
          <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <MoreVertical size={16} />
          </button>
        )}
      </div>
      {open && (
        <div
          className={`absolute top-full mt-1 ${align === 'right' ? 'right-0' : 'left-0'} bg-white border border-brand-border rounded-lg shadow-lg py-1 min-w-[160px] z-40`}
        >
          {items.map((item, i) =>
            item.separator ? (
              <hr key={i} className="my-1 border-brand-border" />
            ) : (
              <button
                key={i}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left flex items-center gap-2 transition-colors cursor-pointer ${
                  item.danger
                    ? 'text-brand-danger hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
