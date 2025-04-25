import React, { useState } from 'react';

export function StockTabs({ onTabChange, activeTab }) {
  const tabs = [
    { name: 'Most Active' },
    { name: 'Trending Now' },
    { name: 'Top Gainers' },
    { name: 'Top Losers' },
  ];

  const handleTabClick = (clickedTabName) => {
    // Tell the parent component which tab was clicked
    if (onTabChange) {
      onTabChange(clickedTabName);
    }
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab.name)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === tab.name
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default StockTabs;