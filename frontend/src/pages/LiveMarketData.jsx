import React, { useState } from 'react';
import { StockTabs } from '../components/StockTabs';
import StockRow from '../components/StockRow';

// Stock categories with their symbols
const stockCategories = {
  'Most Active': [
    "RELIANCE.BSE", "TCS.BSE", "HDFCBANK.BSE", "INFY.BSE",
    "ADANIENT.BSE", "ICICIBANK.BSE", "SBIN.BSE", "TATAMOTORS.BSE"
  ],
  'Trending Now': [
    "TATAMOTORS.BSE", "WIPRO.BSE", "ICICIBANK.BSE", "SBIN.BSE",
    "ZOMATO.BSE", "IRCTC.BSE", "ITC.BSE", "DRREDDY.BSE"
  ],
  'Top Gainers': [
    "BHARTIARTL.BSE", "ASIANPAINT.BSE", "HINDUNILVR.BSE", "TATACONSUM.BSE",
    "MARUTI.BSE", "LT.BSE", "BAJAJFINSV.BSE", "KOTAKBANK.BSE"
  ],
  'Top Losers': [
    "JSWSTEEL.BSE", "SUNPHARMA.BSE", "COALINDIA.BSE", "TECHM.BSE",
    "POWERGRID.BSE", "ONGC.BSE", "AXISBANK.BSE", "HCLTECH.BSE"
  ]
};

export function LiveMarketData() {
  const [activeTab, setActiveTab] = useState('Most Active');
  const [symbols, setSymbols] = useState(stockCategories['Most Active']);

  // Handle tab changes
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSymbols(stockCategories[tabName] || []);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Live Market Data</h1>
          
          <StockTabs onTabChange={handleTabChange} activeTab={activeTab} />
          
          <div className="mt-6">
            {symbols.map((symbol) => (
              <StockRow key={symbol} symbol={symbol} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

export default LiveMarketData;