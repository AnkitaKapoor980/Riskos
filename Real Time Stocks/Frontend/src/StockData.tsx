import React, { useState, useEffect } from 'react';

interface Stock {
    company: string;
    price: number | string;
    change: number | string;
    changePercent: number | string;
}

interface StockDataProps {
    symbol: string;
}

const StockData: React.FC<StockDataProps> = ({ symbol }) => {
    const [stock, setStock] = useState<Stock | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch from your backend API instead of Finnhub
                const response = await fetch(`http://localhost:5000/api/stock/${symbol}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch stock data');
                }
                const data = await response.json();
                setStock(data);
            } catch (error: any) {
                setError(error.message);
                console.error("Error fetching stock data:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
        // Set up polling every minute
        const interval = setInterval(fetchStockData, 60000);
        
        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [symbol]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!stock) return <div>No data available</div>;

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="text-xl font-bold mb-2">{stock.company}</h2>
            <div className="grid gap-2">
                <p>Price: ₹{stock.price}</p>
                <p>Change: ₹{stock.change}</p>
                <p>Change %: {stock.changePercent}%</p>
            </div>
        </div>
    );
};

export default StockData;