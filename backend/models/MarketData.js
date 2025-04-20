const axios = require("axios");
const StockPrice = require("../models/StockPrice");  // Mongoose model to store stock prices

// Function to fetch and store real-time stock data
const storeStockPrice = async (symbol) => {
    try {
        const apiUrl = `https://api.example.com/stock/${symbol}/quote`;  // Replace with your real API URL

        // Fetch stock data
        const response = await axios.get(apiUrl);

        const { latestPrice, change, changePercent } = response.data;

        // Create a new stock price entry and save to database
        const newStockPrice = new StockPrice({
            symbol,
            price: latestPrice,
            change,
            percentChange: changePercent,
            timestamp: new Date()
        });

        await newStockPrice.save();  // Save to database

        console.log(`Stored data for ${symbol}`);
    } catch (error) {
        console.error(`Failed to store data for ${symbol}`, error.message);
    }
};

// Example usage: Store stock prices for a list of symbols
const storeMultipleStockPrices = async (symbols) => {
    for (const symbol of symbols) {
        await storeStockPrice(symbol);
    }
};

module.exports = { storeStockPrice, storeMultipleStockPrices };
