import React, { useState } from 'react';
import { StockTabs } from '../components/StockTabs';
import { StockData } from '../components/StockData';

export function LiveMarketData() {
  const [activeTab, setActiveTab] = useState('most-active');

  const getSymbolsForTab = (tab) => {
    switch (tab) {
      case 'most-active':
        return ['RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS'];
      case 'top-gainers':
        return ['HCLTECH.NS', 'ICICIBANK.NS', 'WIPRO.NS', 'ONGC.BSE'];
      case 'top-losers':
        return ['ADANIENT.NS', 'COALINDIA.NS', 'TITAN.NS', 'ASIANPAINT.NS'];
      case 'trending-now':
        return ['SBIN.NS', 'AXISBANK.NS', 'BHARTIARTL.NS', 'ULTRACEMCO.NS'];
      default:
        return [];
    }
  };

  const symbols = getSymbolsForTab(activeTab);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Live Market Data</h1>

          {/* Pass tab state down */}
          <StockTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Stock cards based on tab */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {symbols.length > 0 ? (
              symbols.map((symbol) => (
                <StockData key={symbol} symbol={symbol} />
              ))
            ) : (
              <p className="col-span-4 text-center text-gray-500">No data available</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}