import React from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  LineChart, Line,
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const PortfolioVisualizations = ({ result }) => {
  if (!result || !result.result) return null;
  
  const { individual_stocks, portfolio_summary } = result.result;
  
  // Extract stock data for charts
  const stocksData = Object.entries(individual_stocks).map(([name, data]) => ({
    name,
    currentValue: data.position_value,
    profitLoss: data.profit_loss,
    buyPrice: data.buy_price,
    currentPrice: data.current_price,
    weight: data.weight * 100, // Convert to percentage
    risk: Math.abs(data.var_amount)
  }));
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
  
  // Format currency values
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format percentage values
  const formatPercent = (value) => {
    return `${value.toFixed(2)}%`;
  };
  
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold">Portfolio Visualizations</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Portfolio Value Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Portfolio Value Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stocksData}
                dataKey="currentValue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, value, percent }) => `${name}: ${formatPercent(percent * 100)}`}
              >
                {stocksData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Profit/Loss by Stock */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Profit/Loss by Stock</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stocksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="profitLoss" fill="#82ca9d" name="Profit/Loss" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Buy vs Current Price */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Buy vs Current Price</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stocksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₹${value}`} />
              <Tooltip formatter={(value) => `₹${value}`} />
              <Legend />
              <Bar dataKey="buyPrice" fill="#8884d8" name="Buy Price" />
              <Bar dataKey="currentPrice" fill="#82ca9d" name="Current Price" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Risk Analysis */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Risk Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stocksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="risk" fill="#ff7675" name="Value at Risk" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Portfolio Summary Card */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(portfolio_summary).map(([key, value]) => (
            <div key={key} className="p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">{key}</p>
              <p className="text-lg font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { PortfolioVisualizations }; 