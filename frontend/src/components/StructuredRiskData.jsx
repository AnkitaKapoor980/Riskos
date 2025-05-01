import React from "react";
import { StockTooltip } from "./StockTooltip";

const RiskMetricCard = ({ title, value, bgColor = "bg-blue-100" }) => (
  <div className={`${bgColor} rounded-lg shadow-md p-4 flex-1`}>
    <h4 className="text-sm font-semibold mb-1">{title}</h4>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const StructuredRiskData = ({ result }) => {
  if (!result) return <div>No data available</div>;

  // Helper for formatting currency values
  const formatCurrency = (value) => {
    if (value === undefined || value === null || value === "N/A") return "N/A";
    
    const numValue = typeof value === "string" ? parseFloat(value.replace(/[₹,]/g, "")) : value;
    
    if (isNaN(numValue)) return "N/A";
    
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(numValue);
  };

  // Helper for formatting percentage values
  const formatPercentage = (value) => {
    if (value === undefined || value === null || value === "N/A") return "N/A";
    
    const numValue = typeof value === "string" ? parseFloat(value.replace(/%/g, "")) : value;
    
    if (isNaN(numValue)) return "N/A";
    
    return `${numValue.toFixed(2)}%`;
  };

  // Extract portfolio summary data with fallbacks
  let portfolioValue = "N/A";
  let confidenceLevel = "95%"; // Default value
  
  try {
    // Check different possible structures
    if (result.portfolioSummary && result.portfolioSummary.totalValue) {
      portfolioValue = result.portfolioSummary.totalValue;
    } else if (result["Total Portfolio Value"]) {
      portfolioValue = result["Total Portfolio Value"];
    } else if (typeof result === "object") {
      // Search for total value in various possible properties
      const possibleKeys = ["totalValue", "Total Portfolio Value", "Portfolio Value", "portfolioValue"];
      for (const key of possibleKeys) {
        if (result[key]) {
          portfolioValue = result[key];
          break;
        }
      }
      
      // Try to find confidence level
      const confidenceKeys = ["Confidence Level", "confidenceLevel", "confidence"];
      for (const key of confidenceKeys) {
        if (result[key]) {
          confidenceLevel = result[key];
          if (typeof confidenceLevel === "number") {
            confidenceLevel = `${confidenceLevel}%`;
          }
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error extracting portfolio summary:", error);
  }

  // Extract risk metrics with fallbacks for different structures and naming conventions
  const getMetricValue = (metricNames, defaultValue = "N/A") => {
    try {
      // Try to find the metric in different possible locations and with different possible names
      
      // First check in result.riskMetrics
      if (result.riskMetrics) {
        for (const name of metricNames) {
          if (result.riskMetrics[name] !== undefined) {
            return result.riskMetrics[name];
          }
        }
      }
      
      // Then check directly in result
      for (const name of metricNames) {
        if (result[name] !== undefined) {
          return result[name];
        }
      }
      
      return defaultValue;
    } catch (error) {
      console.error(`Error accessing metrics ${metricNames}:`, error);
      return defaultValue;
    }
  };

  // Get risk metrics with various possible property names
  const var_value = getMetricValue(["Value at Risk (VaR)", "VaR", "var", "ValueAtRisk"]);
  const cvar_value = getMetricValue(["Conditional VaR (CVaR)", "CVaR", "cvar", "ConditionalVaR"]);
  const sharpe = getMetricValue(["Sharpe Ratio", "Sharpe", "sharpe", "sharpeRatio"]);
  const maxDrawdown = getMetricValue(["Max Drawdown", "Maximum Drawdown", "maxDrawdown", "MaxDrawdown"]);

  // Extract individual stocks data
  let stocks = [];
  
  try {
    // Try different potential formats for stock data
    if (Array.isArray(result.inputSummary)) {
      stocks = result.inputSummary;
    } else if (Array.isArray(result.portfolio)) {
      stocks = result.portfolio;
    } else if (result.individualStocks) {
      // Convert individual stocks object to array if needed
      stocks = Object.entries(result.individualStocks).map(([ticker, data]) => ({
        ticker,
        ...data
      }));
    } else {
      // Fallback: Extract stock information from any matching property
      const possibleStockProps = ["stocks", "reliance", "individual_stock_details"];
      for (const prop of possibleStockProps) {
        if (result[prop] && typeof result[prop] === 'object') {
          if (Array.isArray(result[prop])) {
            stocks = result[prop];
          } else {
            stocks = Object.entries(result[prop]).map(([ticker, data]) => ({
              ticker,
              ...data
            }));
          }
          break;
        }
      }
      
      // If no matching property was found, check if we need to create a single stock entry
      if (stocks.length === 0 && result.ticker) {
        stocks = [{ ticker: result.ticker, ...result }];
      } else if (stocks.length === 0 && result.VaR && !Array.isArray(stocks)) {
        // Create a single Reliance stock entry from top-level metrics
        stocks = [{ 
          ticker: "Reliance", 
          VaR: var_value,
          CVaR: cvar_value,
          Sharpe: sharpe,
          "Max Drawdown": maxDrawdown
        }];
      }
    }
  } catch (error) {
    console.error("Error processing stock data:", error);
    stocks = [];
  }

  return (
    <div className="text-gray-800">
      {/* Portfolio Summary Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">📋 Portfolio Summary</h3>
        <div className="bg-gray-50 rounded-lg shadow-md p-4">
          <div className="mb-2">
            <span className="font-medium">Confidence Level:</span>{" "}
            <span>{confidenceLevel}</span>
          </div>
          <div>
            <span className="font-medium">Total Portfolio Value:</span>{" "}
            <span>{formatCurrency(portfolioValue)}</span>
          </div>
        </div>
      </div>

      {/* Risk Metrics Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">📊 Risk Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <RiskMetricCard 
            title="Value at Risk (VaR)" 
            value={formatCurrency(var_value)} 
            bgColor="bg-blue-100" 
          />
          <RiskMetricCard 
            title="Conditional VaR (CVaR)" 
            value={formatCurrency(cvar_value)} 
            bgColor="bg-red-100" 
          />
          <RiskMetricCard 
            title="Sharpe Ratio" 
            value={sharpe !== "N/A" ? Number(sharpe).toFixed(2) : "N/A"} 
            bgColor="bg-green-100" 
          />
          <RiskMetricCard 
            title="Max Drawdown" 
            value={formatPercentage(maxDrawdown)} 
            bgColor="bg-yellow-100" 
          />
        </div>
      </div>

      {/* Individual Stocks Section */}
      {stocks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">💼 Individual Stock Details</h3>
          <div className="space-y-4">
            {stocks.map((stock, index) => (
              <div 
                key={stock.ticker || index}
                className="bg-gray-50 rounded-lg shadow-md p-4"
              >
                <div className="flex flex-wrap items-center justify-between">
                  <h4 className="text-lg font-medium text-blue-800">
                    {stock.ticker || stock.name || `Stock ${index + 1}`}
                  </h4>
                  <div className="flex flex-wrap gap-4 mt-2 sm:mt-0">
                    <div>
                      <span className="text-sm text-gray-600">VaR:</span>{" "}
                      <span className="font-medium">
                        {formatCurrency(stock.VaR || stock.var)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">CVaR:</span>{" "}
                      <span className="font-medium">
                        {formatCurrency(stock.CVaR || stock.cvar)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Sharpe:</span>{" "}
                      <span className="font-medium">
                        {(stock.Sharpe || stock.sharpe || stock["Sharpe Ratio"]) !== undefined 
                          ? Number(stock.Sharpe || stock.sharpe || stock["Sharpe Ratio"]).toFixed(2) 
                          : "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Max Drawdown:</span>{" "}
                      <span className="font-medium">
                        {formatPercentage(stock["Max Drawdown"] || stock.maxDrawdown || stock.MaxDrawdown)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Tooltip with detailed metrics */}
                <div className="hidden">
                  <StockTooltip stock={stock} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export  { StructuredRiskData };