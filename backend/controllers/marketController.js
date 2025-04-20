// controllers/marketController.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import yahooFinance from 'yahoo-finance2';  // Ensure Yahoo Finance module is imported

dotenv.config(); // Load environment variables from .env

const TIINGO_API_KEY = process.env.TIINGO_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Helper function to fetch stock data from Yahoo Finance
const fetchYahoo = async (symbol) => {
    console.log(`[Yahoo] Fetching data for ${symbol}`);
    try {
        const data = await yahooFinance.quote(symbol);
        if (data.regularMarketPrice) {
            return {
                source: 'Yahoo',
                price: data.regularMarketPrice,
            };
        } else {
            throw new Error('Yahoo Finance returned invalid data');
        }
    } catch (error) {
        console.error(`Yahoo API failed for ${symbol}: ${error.message}`);
        throw new Error('Yahoo API Error');
    }
};

// Helper function to fetch stock data from Tiingo
const fetchTiingo = async (symbol) => {
    console.log(`[Tiingo] Fetching data for ${symbol}`);
    try {
        const response = await fetch(
            `https://api.tiingo.com/tiingo/daily/${symbol}/prices?token=${TIINGO_API_KEY}`
        );
        const data = await response.json();
        if (data && data.length > 0) {
            return {
                source: 'Tiingo',
                price: data[0].close,
            };
        } else {
            throw new Error('No data returned from Tiingo');
        }
    } catch (error) {
        console.error(`Tiingo API failed for ${symbol}: ${error.message}`);
        throw new Error('Tiingo API Error');
    }
};

// Helper function to fetch stock data from AlphaVantage
// Helper function to fetch stock data from AlphaVantage
const fetchAlphaVantage = async (symbol) => {
    console.log(`[AlphaVantage] Fetching data for ${symbol}`);
    try {
        const nseSymbol = symbol.includes("BSE") ? symbol.replace(".BSE", "") : symbol; // Remove BSE if present
        const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${nseSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const data = await response.json();
        const quote = data['Global Quote'];
        if (quote) {
            return {
                source: 'AlphaVantage',
                price: parseFloat(quote['05. price']),
            };
        }
        throw new Error('No data from AlphaVantage');
    } catch (error) {
        console.error(`AlphaVantage API failed for ${symbol}: ${error.message}`);
        throw new Error('AlphaVantage API Error');
    }
};


// Function to fetch stock data from multiple sources
const fetchStockData = async (symbol) => {
    try {
        // Attempt to fetch data from Yahoo Finance
        return await fetchYahoo(symbol);
    } catch (yahooError) {
        console.error('Yahoo API error:', yahooError.message);
        try {
            // Attempt to fetch data from Tiingo
            return await fetchTiingo(symbol);
        } catch (tiingoError) {
            console.error('Tiingo API error:', tiingoError.message);
            try {
                // Attempt to fetch data from AlphaVantage
                return await fetchAlphaVantage(symbol);
            } catch (alphaError) {
                console.error('AlphaVantage API error:', alphaError.message);
                return {
                    source: 'Error',
                    price: 'N/A',
                };
            }
        }
    }
};

// Function to handle stock price request
export const getPrice = async (req, res) => {
    const { symbol } = req.params;

    try {
        const data = await fetchStockData(symbol);

        if (data.price === 'N/A') {
            return res.status(500).json({ error: 'Failed to fetch stock price from all sources' });
        }

        res.json({
            symbol,
            price: data.price,
            source: data.source,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock price' });
    }
};
