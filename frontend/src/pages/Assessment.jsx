import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import StockTooltip from '../components/StockTooltip';
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { PortfolioVisualizations } from "./PortfolioVisualizations";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Assessment = () => {
  const { isLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stockData, setStockData] = useState([{ stockName: "", quantity: "", buyPrice: "" }]);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [forecastDays, setForecastDays] = useState(30);
  const [riskType, setRiskType] = useState('');
  const [result, setResult] = useState(null); // Corrected the variable name here
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState("calculate");
  const [error, setError] = useState(null);
  const { user } = useAuth();

  
  const handleAddStock = () => {
    setStockData([...stockData, { stockName: "", quantity: "", buyPrice: "" }]);
  };

  const handleRemoveStock = (index) => {
    const currentRow = stockData[index];
    const isFilled = currentRow.stockName || currentRow.quantity || currentRow.buyPrice;
    if (isFilled && !window.confirm("This row has data. Delete it?")) return;
    const updated = [...stockData];
    updated.splice(index, 1);
    setStockData(updated);
  };

  const handleChange = (index, field, value) => {
    const updated = [...stockData];
    updated[index][field] = value;
    setStockData(updated);
  };

  const handleSubmit = async () => {
    // Check if user is logged in *after* they press Submit
    const token = user?.token || localStorage.getItem("token"); // Only use one source for the token
    
    if (!token || !user) {
      navigate("/signup");
      return;
    }
  
    // Validate inputs
    const hasEmptyFields = stockData.some(stock =>
      !stock.stockName || !stock.quantity || !stock.buyPrice
    );
  
    if (hasEmptyFields) {
      setError("Please fill in all stock details");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    const payload = {
      portfolio: stockData,
      confidenceLevel,
      ...(activeMode === "forecast" && {
        forecastDays,
        folderPath: "flask-api\\Scripts"
      }),
    };
  
    try {
      const response = await axios.post(
        `http://localhost:5000/api/${activeMode === "forecast" ? "predict/analyze" : "risk/calculate"}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error calculating risk:", error);
      setError(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">📈 Portfolio Risk Analysis</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Input Portfolio Details</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Stock Name</th>
              <th className="p-2 text-left">Quantity</th>
              <th className="p-2 text-left">Buy Price (₹)</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((stock, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">
                  <input
                    type="text"
                    value={stock.stockName}
                    onChange={(e) => handleChange(index, "stockName", e.target.value)}
                    placeholder="e.g. RELIANCE"
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={stock.quantity}
                    onChange={(e) => handleChange(index, "quantity", e.target.value)}
                    placeholder="e.g. 10"
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={stock.buyPrice}
                    onChange={(e) => handleChange(index, "buyPrice", e.target.value)}
                    placeholder="e.g. 2500"
                    className="w-full border rounded px-2 py-1"
                  />
                </td>
                <td className="p-2 flex gap-2 items-center">
                  {stockData.length > 1 && (
                    <FaMinusCircle
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleRemoveStock(index)}
                    />
                  )}
                  {index === stockData.length - 1 && (
                    <FaPlusCircle
                      className="text-green-500 cursor-pointer"
                      onClick={handleAddStock}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block mb-1 font-medium">Confidence Level (%)</label>
            <input
              type="number"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(e.target.value)}
              placeholder="e.g. 95"
              className="w-full border rounded px-2 py-1"
            />
          </div>

          {activeMode === "forecast" && (
            <div>
              <label className="block mb-1 font-medium">Forecast Days</label>
              <input
                type="number"
                value={forecastDays}
                onChange={(e) => setForecastDays(e.target.value)}
                placeholder="e.g. 30"
                className="w-full border rounded px-2 py-1"
              />
            </div>
          )}

          <div className="flex items-end gap-2">
            <button
              onClick={() => setActiveMode("calculate")}
              className={`px-4 py-2 rounded ${activeMode === "calculate" ? "bg-blue-600 text-white" : "border"}`}
            >
              Calculate Current Risk
            </button>
            <button
              onClick={() => setActiveMode("forecast")}
              className={`px-4 py-2 rounded ${activeMode === "forecast" ? "bg-purple-600 text-white" : "border"}`}
            >
              Forecast Future Risk
            </button>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-4 ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"} text-white px-4 py-2 rounded flex items-center justify-center`}
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Submit"
          )}
        </button>
      </div>

      {result && (
        <div className="mt-6">
          <PortfolioVisualizations result={result} />
          <details className="mt-6 bg-gray-100 p-4 rounded border">
            <summary className="text-lg font-semibold cursor-pointer">📊 Raw Result Data</summary>
            <pre className="whitespace-pre-wrap text-sm mt-2 p-2 bg-white rounded">{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      )}
    </div>
  );
};

export { Assessment };
