'use client';

import { useState } from 'react';

export function Tabs({ tabs, defaultTab = 0, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={className}>
      <div className="flex gap-8 overflow-x-auto border-b border-brand-border">
        {tabs.map((tab, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`relative px-0 py-5 text-base font-semibold whitespace-nowrap transition-all duration-200 border-b-[3px] cursor-pointer ${
              activeTab === index
                ? 'border-brand-yellow text-brand-black'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-10">{tabs[activeTab]?.content}</div>
    </div>
  );
}
