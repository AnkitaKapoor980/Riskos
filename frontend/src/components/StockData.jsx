import React, { useEffect, useState } from 'react';

const StockData = ({ symbol }) => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/market/price/${symbol}`);
        const data = await response.json();
        
        if (data.success) {
          setStockData(data);
        } else {
          throw new Error(data.error || 'Failed to load data');
        }
      } catch (error) {
        console.error('Fetch error:', error);
        // Fallback data structure
        setStockData({
          symbol,
          price: 0,
          change: 0,
          changePercent: 0,
          source: 'Error',
          marketCap: 'N/A',
          peRatio: 'N/A',
          dividendYield: 'N/A',
          fiftyTwoWeekRange: 'N/A'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  if (loading) return <div className="p-4 border rounded-lg">Loading...</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold text-lg">
        {stockData.symbol.replace('.BSE', '').replace('.NS', '')}
      </h3>
      <p className={stockData.change >= 0 ? 'text-green-600' : 'text-red-600'}>
        ₹{stockData.price.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
      </p>
      <p className="text-sm">Source: {stockData.source}</p>
    </div>
  );
};

export default StockData;