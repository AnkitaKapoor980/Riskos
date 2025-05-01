import React from "react";
import StockTooltip from "./StockTooltip";

const RiskMetricCard = ({ title, value, bgColor = "bg-blue-100" }) => (
  <div className={`${bgColor} rounded-lg shadow-md p-4 flex-1`}>
    <h4 className="text-sm font-semibold mb-1">{title}</h4>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const StructuredRiskData = ({ result }) => {
  // Early return if no result
  if (!result) return null;
  
  // Format currency values
  const formatCurrency = (val) => {
    if (val === undefined || val === null) return "N/A";
    return `₹${typeof val === 'number' ? Math.abs(val).toFixed(2) : val}`;
  };
  
  // Format percentage values
  const formatPercent = (val) => {
    if (val === undefined || val === null) return "N/A";
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    return `${(numVal * 100).toFixed(2)}%`;
  };

  // Extract data from result based on structure
  const portfolioSummary = result.portfolio_summary || {};
  const individualStocks = result.individual_stocks || {};
  
  // Extract or create input summary
  let stocksList = [];
  if (result.inputSummary && Array.isArray(result.inputSummary)) {
    stocksList = result.inputSummary;
  } else if (Array.isArray(result.portfolio)) {
    stocksList = result.portfolio;
  } else {
    // Create stock list from individual_stocks if necessary
    stocksList = Object.keys(individualStocks).map(stockName => ({
      stockName: stockName.toUpperCase(),
      quantity: "N/A", // We don't have this info from the backend structure
      buyPrice: "N/A"  // We don't have this info from the backend structure
    }));
  }
  
  const confidenceLevel = result.confidenceLevel || 95;
  
  return (
    <div className="space-y-6">
      {/* Portfolio Summary Section */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">📋 Portfolio Summary</h3>
        
        {stocksList.length > 0 && (
          <ul className="list-disc pl-5 mb-4">
            {stocksList.map((stock, idx) => (
              <li key={idx} className="flex items-center">
                <strong>{stock.stockName}</strong>
                {stock.quantity && stock.quantity !== "N/A" && `: ${stock.quantity} shares`}
                {stock.buyPrice && stock.buyPrice !== "N/A" && ` @ ${formatCurrency(stock.buyPrice)}`}
                {individualStocks[stock.stockName.toLowerCase()] && (
                  <StockTooltip 
                    symbol={stock.stockName} 
                    metrics={{
                      "VaR (₹)": individualStocks[stock.stockName.toLowerCase()]["VaR (₹)"] || 0,
                      "CVaR (₹)": individualStocks[stock.stockName.toLowerCase()]["CVaR (₹)"] || 0,
                      "Sharpe Ratio": individualStocks[stock.stockName.toLowerCase()]["Sharpe Ratio"] || 0,
                      "Max Drawdown": individualStocks[stock.stockName.toLowerCase()]["Max Drawdown"] || 0
                    }} 
                  />
                )}
              </li>
            ))}
          </ul>
        )}
        
        <p className="text-sm mb-2">Confidence Level: {confidenceLevel}%</p>
        
        {portfolioSummary["Total Portfolio Value (₹)"] && (
          <p className="text-sm font-medium">
            Total Portfolio Value: {formatCurrency(portfolioSummary["Total Portfolio Value (₹)"])}
          </p>
        )}
      </div>

      {/* Risk Metrics Card Section */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">📊 Risk Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <RiskMetricCard 
            title="Value at Risk (VaR)" 
            value={portfolioSummary["VaR (₹)"] ? formatCurrency(portfolioSummary["VaR (₹)"]) : "N/A"} 
            bgColor="bg-blue-50"
          />
          <RiskMetricCard 
            title="Conditional VaR (CVaR)" 
            value={portfolioSummary["CVaR (₹)"] ? formatCurrency(portfolioSummary["CVaR (₹)"]) : "N/A"} 
            bgColor="bg-red-50"
          />
          <RiskMetricCard 
            title="Sharpe Ratio" 
            value={portfolioSummary["Sharpe Ratio"] !== undefined ? portfolioSummary["Sharpe Ratio"] : "N/A"} 
            bgColor="bg-green-50"
          />
          <RiskMetricCard 
            title="Max Drawdown" 
            value={portfolioSummary["Max Drawdown"] !== undefined ? formatPercent(portfolioSummary["Max Drawdown"]) : "N/A"} 
            bgColor="bg-yellow-50"
          />
        </div>
      </div>

      {/* Individual Stocks Section (only if data exists) */}
      {Object.keys(individualStocks).length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">📌 Individual Stock Details</h3>
          <div className="space-y-3">
            {Object.entries(individualStocks).map(([stockName, metrics], idx) => (
              <div key={idx} className="border p-3 rounded-md">
                <h4 className="font-medium mb-2 capitalize">{stockName}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="text-sm">
                    <span className="font-semibold">VaR:</span> {metrics["VaR (₹)"] ? formatCurrency(metrics["VaR (₹)"]) : "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">CVaR:</span> {metrics["CVaR (₹)"] ? formatCurrency(metrics["CVaR (₹)"]) : "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Sharpe:</span> {metrics["Sharpe Ratio"] !== undefined ? metrics["Sharpe Ratio"] : "N/A"}
                  </div>
                  <div className="text-sm">
                    <span className="font-semibold">Max Drawdown:</span> {metrics["Max Drawdown"] !== undefined ? formatPercent(metrics["Max Drawdown"]) : "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { StructuredRiskData, RiskMetricCard };