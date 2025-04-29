import axios from 'axios';
import { useEffect, useState } from 'react';
import PortfolioChart from '../components/PortfolioChart';
import PortfolioTable from '../components/PortfolioTable';
import StockSearch from "../components/StockSearch";

export function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState([]);

  // Fetch existing portfolio on mount
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/portfolios', {  // full URL
          headers: { Authorization: `Bearer ${token}` }
        });
        setPortfolio(response.data);   // assuming response.data is array of stocks
      } catch (error) {
        console.error('Error fetching portfolios:', error);
      }
    };

    fetchPortfolios();
  }, []);

  // Add stock manually
  const handleAddStock = (stock) => {
    const quantity = parseFloat(prompt(`Enter quantity for ${stock.symbol}`));
    const buyPrice = parseFloat(prompt(`Enter buy price for ${stock.symbol}`));
    if (!quantity || !buyPrice) return;

    const newStock = { ...stock, quantity, buyPrice };

    setPortfolio((prev) => [...prev, newStock]);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Portfolio</h2>

      {/* Chart and Table */}
      <PortfolioChart holdings={portfolio} />  {/* passing real data */}
      <PortfolioTable holdings={portfolio} />  {/* passing real data */}

      {/* Stock Search */}
      <div className="mt-8">
        <StockSearch onAdd={handleAddStock} />
      </div>
    </div>
  );
}

export default PortfolioDashboard;
