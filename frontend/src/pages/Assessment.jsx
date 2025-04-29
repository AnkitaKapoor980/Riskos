import React, { useState } from 'react';
import axios from 'axios';
import StockTooltip from '../components/StockTooltip';


const Assessment = () => {
  const [stocks, setStocks] = useState([{ name: '', quantity: '', buyPrice: '' }]);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStockChange = (index, field, value) => {
    const updatedStocks = [...stocks];
    updatedStocks[index][field] = value;
    setStocks(updatedStocks);
  };

  const addStock = () => {
    setStocks([...stocks, { name: '', quantity: '', buyPrice: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const payload = {
        portfolio: stocks.map((s) => ({
          symbol: s.name.trim().toUpperCase() + '.NS',
          quantity: Number(s.quantity),
          buy_price: Number(s.buyPrice)
        })),
        confidence_level: Number(confidenceLevel)
      };

      const response = await axios.post('http://localhost:5000/api/risk/calculate', payload);
      setResults(response.data);
    } catch (error) {
      console.error('Error calculating risk:', error);
      alert('Something went wrong while calculating risk. Check backend logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Risk Assessment</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {stocks.map((stock, index) => (
          <div key={index} className="flex flex-wrap gap-4 items-end border p-4 rounded-lg shadow-sm bg-white">
            <div className="flex-1">
              <label className="block mb-1 font-medium">Stock Symbol</label>
              <input
                type="text"
                value={stock.name}
                onChange={(e) => handleStockChange(index, 'name', e.target.value)}
                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., RELIANCE"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">Quantity</label>
              <input
                type="number"
                value={stock.quantity}
                onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">Buy Price (₹)</label>
              <input
                type="number"
                value={stock.buyPrice}
                onChange={(e) => handleStockChange(index, 'buyPrice', e.target.value)}
                className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={addStock}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            + Add Stock
          </button>

          <div>
            <label className="block mb-1 font-medium">Confidence Level (%)</label>
            <input
              type="number"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(e.target.value)}
              min={80}
              max={99}
              className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {loading ? 'Calculating...' : 'Calculate Risk'}
          </button>
        </div>
      </form>

      {results && (
        <div className="mt-10 space-y-8">
          <div className="bg-gray-100 p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">🧾 Portfolio Summary</h3>
            <ul className="list-disc ml-6 text-gray-700">
              {stocks.map((s, idx) => (
                <li key={idx}>
                  <strong>{s.name.toUpperCase()}</strong>: {s.quantity} shares @ ₹{s.buyPrice}
                    {results.individual_stocks[s.name.toUpperCase() + '.NS'] && (
                    <StockTooltip
                        symbol={s.name.toUpperCase()}
                        metrics={results.individual_stocks[s.name.toUpperCase() + '.NS']}
                    />
                    )}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-gray-600">Confidence Level: <strong>{confidenceLevel}%</strong></p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">📊 Risk Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-gray-700">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Value at Risk (VaR)</p>
                <p className="text-xl font-bold text-blue-700">
                  ₹{results.portfolio_summary["VaR (₹)"].toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-500">Conditional VaR (CVaR)</p>
                <p className="text-xl font-bold text-red-700">
                  ₹{results.portfolio_summary["CVaR (₹)"].toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">Sharpe Ratio</p>
                <p className="text-xl font-bold text-green-700">
                  {results.portfolio_summary["Sharpe Ratio"].toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-500">Max Drawdown</p>
                <p className="text-xl font-bold text-yellow-700">
                  {(results.portfolio_summary["Max Drawdown"] * 100).toFixed(2)}%
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg col-span-2">
                <p className="text-sm text-gray-500">Total Portfolio Value</p>
                <p className="text-xl font-bold text-purple-700">
                  ₹{results.portfolio_summary["Total Portfolio Value (₹)"].toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { Assessment };