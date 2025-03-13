import React, { useState } from 'react';
import clsx from 'clsx';

export function StockTabs() {
  const [tabs, setTabs] = useState([
    { name: 'Most Active', current: true },
    { name: 'Trending Now', current: false },
    { name: 'Top Gainers', current: false },
    { name: 'Top Losers', current: false },
  ]);

  const handleTabClick = (clickedTab) => {
    const updatedTabs = tabs.map(tab => ({
      ...tab,
      current: tab.name === clickedTab.name
    }));
    setTabs(updatedTabs);
  };

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => handleTabClick(tab)}
            className={clsx(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
              tab.current
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
}