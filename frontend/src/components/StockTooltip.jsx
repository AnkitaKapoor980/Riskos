import React, { useState } from 'react';

const StockTooltip = ({ symbol, metrics }) => {
  const [visible, setVisible] = useState(false);

  return (
    <span className="relative ml-2">
      <span
        className="cursor-pointer text-blue-600 font-bold"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
      >
        ℹ️
      </span>

      {visible && (
        <div className="absolute z-10 w-64 p-3 bg-white border border-gray-300 rounded-lg shadow-xl text-sm left-4 top-6">
          <p className="font-semibold mb-1">{symbol} Risk Metrics</p>
          <ul className="space-y-1">
            <li><strong>VaR:</strong> ₹{metrics["VaR (₹)"].toFixed(2)}</li>
            <li><strong>CVaR:</strong> ₹{metrics["CVaR (₹)"].toFixed(2)}</li>
            <li><strong>Sharpe:</strong> {metrics["Sharpe Ratio"].toFixed(2)}</li>
            <li><strong>Max Drawdown:</strong> {(metrics["Max Drawdown"] * 100).toFixed(2)}%</li>
          </ul>
        </div>
      )}
    </span>
  );
};

export  { StockTooltip };
