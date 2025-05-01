import React from "react";

const RiskCard = ({ title, value }) => (
  <div className="bg-blue-100 rounded-lg shadow-md p-4 w-full sm:w-1/2 md:w-1/3">
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const StructuredRiskData = ({ result }) => {
  // Check if result has the expected structure
  if (!result) return null;
  
  const { inputSummary, portfolioRisk, stockLevelMetrics } = result;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Portfolio Risk Analysis</h2>
      
      {inputSummary && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">🧾 Input Summary</h3>
          <ul className="list-disc pl-5 text-gray-700">
            {inputSummary.map((item, idx) => (
              <li key={idx}>
                <strong>{item.stockName}</strong> — {item.quantity} shares @ ₹{item.buyPrice}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {portfolioRisk && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">📉 Portfolio Risk Metrics</h3>
          <div className="flex flex-wrap gap-4">
            <RiskCard title="Value at Risk (VaR)" value={`₹${portfolioRisk.var || 'N/A'}`} />
            <RiskCard title="Conditional VaR (CVaR)" value={`₹${portfolioRisk.cvar || 'N/A'}`} />
            <RiskCard title="Sharpe Ratio" value={portfolioRisk.sharpeRatio || 'N/A'} />
            <RiskCard title="Max Drawdown" value={`₹${portfolioRisk.maxDrawdown || 'N/A'}`} />
          </div>
        </div>
      )}
      
      {stockLevelMetrics && stockLevelMetrics.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">📌 Individual Stock Risk</h3>
          {stockLevelMetrics.map((stock, idx) => (
            <div key={idx} className="mb-4 border rounded p-4">
              <h4 className="text-md font-bold mb-2">{stock.stockName}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <RiskCard title="VaR" value={`₹${stock.var || 'N/A'}`} />
                <RiskCard title="CVaR" value={`₹${stock.cvar || 'N/A'}`} />
                <RiskCard title="Sharpe Ratio" value={stock.sharpeRatio || 'N/A'} />
                <RiskCard title="Max Drawdown" value={`₹${stock.maxDrawdown || 'N/A'}`} />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Handle any other potential data in the result */}
      {Object.keys(result).filter(key => 
        !['inputSummary', 'portfolioRisk', 'stockLevelMetrics'].includes(key) && 
        result[key] && 
        typeof result[key] === 'object'
      ).map(key => (
        <div key={key} className="mt-4">
          <h3 className="text-lg font-semibold mb-2">{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
          <div className="bg-gray-50 p-3 rounded border">
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result[key], null, 2)}</pre>
          </div>
        </div>
      ))}
    </div>
  );
};

export { StructuredRiskData, RiskCard };