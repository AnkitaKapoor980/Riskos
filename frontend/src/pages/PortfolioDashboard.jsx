import { useState, useEffect } from "react";
import axios from "axios";
import PortfolioChart from "../components/PortfolioChart";
import PortfolioTable from "../components/PortfolioTable";
import StockSearch from "../components/StockSearch";

export function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState([]);

  // Function to fetch portfolio from backend
  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming you store token in localStorage
      const response = await axios.get("/api/portfolio", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPortfolio(response.data);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    }
  };

  // Fetch portfolio on page load
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const handleAddStock = async (stock) => {
    const quantity = parseFloat(prompt(`Enter quantity for ${stock.symbol}`));
    const buyPrice = parseFloat(prompt(`Enter buy price for ${stock.symbol}`));
    if (!quantity || !buyPrice) return;

    const newStock = { ...stock, quantity, buyPrice };

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/portfolio", newStock, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Update local state after successful POST
      setPortfolio((prev) => [...prev, newStock]);
    } catch (error) {
      console.error("Failed to add stock:", error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Portfolio</h2>

      {/* Chart and Table */}
      <PortfolioChart data={portfolio} />
      <PortfolioTable data={portfolio} />

      {/* Stock Search and Manual Table */}
      <div className="mt-8">
        <StockSearch onAdd={handleAddStock} />

        {portfolio.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Holdings</h3>
            <table className="w-full border text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2">Symbol</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Change %</th>
                  <th className="p-2">P/E</th>
                  <th className="p-2">Dividend Yield</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.map((stock, idx) => (
                  <tr key={idx} className="text-center border-t">
                    <td className="p-2">{stock.symbol}</td>
                    <td className="p-2">₹{stock.price}</td>
                    <td className="p-2">{stock.changePercent?.toFixed(2)}%</td>
                    <td className="p-2">{stock.peRatio}</td>
                    <td className="p-2">{stock.dividendYield}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
