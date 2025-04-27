import { useState, useEffect } from 'react';
import { StockTabs } from '../components/StockTabs';
import { FiSearch, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

// Fallback APIs
const fetchYahooFinance = async (activeTab) => {
  try {
    const response = await fetch(`https://yahoo-finance-api-url/${activeTab}`);
    if (!response.ok) throw new Error('Failed to fetch Yahoo Finance data');
    const data = await response.json();
    return data; 
  } catch (err) {
    console.error("Yahoo Finance Error:", err);
    return null; 
  }
};

const fetchAlphaVantage = async (activeTab) => {
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${activeTab}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch Alpha Vantage data');
    const data = await response.json();
    return data; 
  } catch (err) {
    console.error("Alpha Vantage Error:", err);
    return null; 
  }
};

const fetchTingo = async (activeTab) => {
  try {
    const response = await fetch(`https://api.tingo.com/stock/${activeTab}?apikey=${process.env.TIINGO_API_KEY}`);
    if (!response.ok) throw new Error('Failed to fetch Tingo data');
    const data = await response.json();
    return data; 
  } catch (err) {
    console.error("Tingo Error:", err);
    return null; 
  }
};

export function LiveMarketData() {
  const [activeTab, setActiveTab] = useState('most-active');
  const [stocks, setStocks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockDetails, setStockDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const demoStocks = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', price: 2780.45, change: 35.70, changePercent: 1.3, volume: 8543200 },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', price: 3456.20, change: -23.45, changePercent: -0.67, volume: 1245900 },
    { symbol: 'INFY.NS', name: 'Infosys', price: 1650.25, change: 15.00, changePercent: 0.92, volume: 3500000 },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', price: 1435.65, change: 12.35, changePercent: 0.87, volume: 2500000 }
  ];

  const fetchStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      let data = await fetchYahooFinance(activeTab);
      
      if (!data) {
        console.log('Yahoo Finance failed, trying Alpha Vantage...');
        data = await fetchAlphaVantage(activeTab);
      }
      
      if (!data) {
        console.log('Alpha Vantage failed, trying Tingo...');
        data = await fetchTingo(activeTab);
      }

      if (!data) {
        setError('Using Demo Data');
        data = demoStocks;
      }

      // Assume the response might be structured differently for each API
      const indianStocks = data.filter(stock => stock.symbol.endsWith('.NS') || stock.symbol.endsWith('.BSE'));

      setStocks(indianStocks);
    } catch (err) {
      console.error(err);
      setError('Error fetching data');
      setStocks(demoStocks); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [activeTab]);

  // Fetch stock details based on selected stock
  const fetchStockDetails = async (symbol) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(`https://some-stock-api.com/details/${symbol}`);
      const data = await response.json();
      setStockDetails(data);
    } catch (err) {
      console.error('Error fetching stock details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const safePrice = (price) => typeof price === 'number' && !isNaN(price) ? price : 0;
  const safeChange = (change) => typeof change === 'number' && !isNaN(change) ? change : 0;

  const handleStockClick = (stock) => {
    setSelectedStock(stock.symbol);
    fetchStockDetails(stock.symbol);  // Fetch details when a stock is selected
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Live Market Data</h1>

      {/* Search */}
      <div className="mb-6 flex items-center border p-2 rounded-lg bg-white shadow">
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow outline-none px-2"
        />
        <button onClick={fetchStocks} className="ml-2 bg-teal-600 text-white p-2 rounded hover:bg-teal-700">
          <FiSearch />
        </button>
      </div>

      {/* Error or Loading */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Stock Tabs */}
      <StockTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Stocks Table */}
      <div className="overflow-x-auto mt-4 bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Symbol</th>
              <th className="text-left p-3">Name</th>
              <th className="text-right p-3">Price (₹)</th>
              <th className="text-right p-3">Change</th>
              <th className="text-right p-3">% Change</th>
              <th className="text-right p-3">Volume</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr
                key={stock.symbol}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => handleStockClick(stock)}  // Handle row click
              >
                <td className="p-3 font-medium">{stock.symbol}</td>
                <td className="p-3">{stock.name}</td>
                <td className="p-3 text-right">₹{safePrice(stock.price).toFixed(2)}</td>
                <td className="p-3 text-right">{safeChange(stock.change).toFixed(2)}</td>
                <td className="p-3 text-right">{safeChange(stock.changePercent).toFixed(2)}%</td>
                <td className="p-3 text-right">{stock.volume.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stock Details */}
      {selectedStock && stockDetails && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Stock Details for {selectedStock}</h2>
          {detailsLoading ? <p>Loading details...</p> : <pre>{JSON.stringify(stockDetails, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}
