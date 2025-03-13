import React, { useEffect, useState } from 'react';
import axios from 'axios';

const StockData = ({ symbol }) => {
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`/api/stock/${symbol}`);
        setStockData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data.message : err.message);
        setLoading(false);
      }
    };

    fetchStockData();
  }, [symbol]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stockData) return <div>No data available</div>;

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold text-lg mb-2">{stockData.symbol}</h3>
      <p className="text-gray-600">Price: ₹{stockData.price.toLocaleString()}</p>
      <p className="text-gray-600">Change: {stockData.change.toFixed(2)}</p>
      <p className="text-gray-600">Change Percent: {stockData.changePercent.toFixed(2)}%</p>
      <p className="text-gray-600">Market Cap: {stockData.marketCap}</p>
      <p className="text-gray-600">P/E Ratio: {stockData.peRatio}</p>
      <p className="text-gray-600">Dividend Yield: {stockData.dividendYield}</p>
      <p className="text-gray-600">52W Range: {stockData.fiftyTwoWeekRange}</p>
    </div>
  );
};

export default StockData;

