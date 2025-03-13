import React from 'react';
import { StockTabs } from '../components/StockTabs';
import StockData from '../components/StockData'; // Import the StockData component

const symbols = ["RELIANCE.BSE", "TCS.BSE", "INFY.BSE", "HDFCBANK.BSE"];

export function LiveMarketData() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Live Market Data</h1>
          <StockTabs />
          <div className="mt-6">
            <div className="grid gap-4">
              {symbols.map((symbol) => (
                <StockData key={symbol} symbol={symbol} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}