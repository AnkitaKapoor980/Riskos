import React, { useState } from "react";
import axios from "axios";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";

const Assessment = () => {
  const [stockData, setStockData] = useState([{ stockName: "", quantity: "", buyPrice: "" }]);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [forecastDays, setForecastDays] = useState(30);
  const [activeMode, setActiveMode] = useState("calculate");
  const [result, setResult] = useState(null);

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
    const payload = {
      portfolio: stockData,
      confidenceLevel,
      ...(activeMode === "forecast" && { forecastDays }),
    };
    try {
      const response = await axios.post(
        `http://localhost:5000/api/${activeMode === "forecast" ? "predict/analyze" : "risk/calculate"}`,
        payload
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error calculating risk:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">📈 Portfolio Risk Analysis</h1>

      <h2 className="text-xl font-semibold">Input Portfolio Details</h2>

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Submit
      </button>

      {result && (
        <div className="mt-6 bg-gray-100 p-4 rounded border">
          <h2 className="text-lg font-semibold mb-2">📊 Results</h2>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export { Assessment };