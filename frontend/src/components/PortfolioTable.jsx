import React, { useState, useEffect } from 'react';

export default function PortfolioTable() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating fetching data
    setTimeout(() => {
      setHoldings([
        { symbol: 'AAPL', price: 145, buyPrice: 130, quantity: 10 },
        { symbol: 'GOOG', price: 2750, buyPrice: 2500, quantity: 5 },
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const totalValue = holdings.reduce((sum, stock) => sum + (stock.price * stock.quantity), 0);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Holdings Summary</h3>
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Symbol</th>
            <th className="p-2 text-right">Quantity</th>
            <th className="p-2 text-right">Buy Price</th>
            <th className="p-2 text-right">Current Price</th>
            <th className="p-2 text-right">Current Value</th>
            <th className="p-2 text-right">P/L</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((stock, idx) => {
            const value = stock.price * stock.quantity;
            const profit = (stock.price - stock.buyPrice) * stock.quantity;
            return (
              <tr key={idx} className="border-t text-right">
                <td className="p-2 text-left">{stock.symbol}</td>
                <td className="p-2">{stock.quantity}</td>
                <td className="p-2">₹{stock.buyPrice}</td>
                <td className="p-2">₹{stock.price}</td>
                <td className="p-2 font-medium">₹{value.toFixed(2)}</td>
                <td className={`p-2 font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{profit.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="text-right mt-4 font-bold">
        Total Portfolio Value: ₹{totalValue.toFixed(2)}
      </div>
    </div>
  );
}
