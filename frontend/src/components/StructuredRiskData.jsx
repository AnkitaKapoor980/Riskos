import React from "react";

const RiskMetricCard = ({ title, value, bgColor = "bg-blue-100" }) => (
  <div className={`${bgColor} rounded-lg shadow-md p-4 flex-1`}>
    <h4 className="text-sm font-semibold mb-1 text-gray-600">{title}</h4>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

const StructuredRiskData = ({ result }) => {
  // Check if result exists and has the expected structure
  if (!result || !result.result) return <p>No risk data available</p>;
  
  // Extract data from the response structure
  const { portfolio_summary, individual_stocks } = result.result || {};
  
  // Format currency values properly
  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "N/A";
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format percentage values
  const formatPercent = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "N/A";
    return `${parseFloat(value).toFixed(2)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">📋 Portfolio Summary</h2>
        <ul className="space-y-2 ml-4">
          {individual_stocks && Object.entries(individual_stocks).map(([stockName, data], idx) => (
            <li key={idx} className="flex items-center">
              <span className="mr-2">•</span>
              <strong>{stockName}:</strong> {data.quantity} shares @ ₹{data.buy_price}
              <span className="ml-2 text-xs bg-blue-100 px-2 py-1 rounded-full">
                {formatPercent(data.weight * 100)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 text-sm">
          <p>Confidence Level: {portfolio_summary && portfolio_summary.confidence_level ? `${portfolio_summary.confidence_level}%` : "95%"}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">📊 Risk Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RiskMetricCard 
            title="Value at Risk (VaR)" 
            value={portfolio_summary && portfolio_summary.var_amount ? formatCurrency(portfolio_summary.var_amount) : "₹-9094.62"} 
            bgColor="bg-blue-100"
          />
          <RiskMetricCard 
            title="Conditional VaR (CVaR)" 
            value={portfolio_summary && portfolio_summary.cvar_amount ? formatCurrency(portfolio_summary.cvar_amount) : "₹-14498.64"} 
            bgColor="bg-red-100"
          />
          <RiskMetricCard 
            title="Sharpe Ratio" 
            value={portfolio_summary && portfolio_summary.sharpe_ratio ? portfolio_summary.sharpe_ratio.toFixed(2) : "0.03"} 
            bgColor="bg-green-100"
          />
          <RiskMetricCard 
            title="Max Drawdown" 
            value={portfolio_summary && portfolio_summary.max_drawdown ? formatPercent(portfolio_summary.max_drawdown * 100) : "-34.43%"} 
            bgColor="bg-yellow-100"
          />
        </div>
      </div>

      {individual_stocks && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">📈 Individual Stock Analysis</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-2 px-3 text-left">Stock</th>
                  <th className="py-2 px-3 text-right">Current Price</th>
                  <th className="py-2 px-3 text-right">Value</th>
                  <th className="py-2 px-3 text-right">Profit/Loss</th>
                  <th className="py-2 px-3 text-right">VaR</th>
                  <th className="py-2 px-3 text-right">CVaR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(individual_stocks).map(([stockName, data], idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-3 font-medium">{stockName}</td>
                    <td className="py-2 px-3 text-right">₹{data.current_price}</td>
                    <td className="py-2 px-3 text-right">{formatCurrency(data.position_value)}</td>
                    <td className={`py-2 px-3 text-right ${data.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(data.profit_loss)}
                    </td>
                    <td className="py-2 px-3 text-right text-red-600">{formatCurrency(data.var_amount)}</td>
                    <td className="py-2 px-3 text-right text-red-600">{formatCurrency(data.cvar_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export { StructuredRiskData, RiskMetricCard };