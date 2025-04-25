const fetch = require('node-fetch');
const dotenv = require('dotenv');
const yahooFinance = require('yahoo-finance2').default;

dotenv.config();

const TIINGO_API_KEY = process.env.TIINGO_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Enhanced symbol formatter
const formatSymbol = {
  yahoo: (symbol) => symbol.replace('.BSE', '.NS').replace('.BOM', '.NS'),
  tiingo: (symbol) => symbol.replace('.BSE', '').replace('.NS', ''),
  alpha: (symbol) => symbol.replace('.BSE', '.BO').replace('.NS', '')
};

// Improved Yahoo Finance fetcher
const fetchYahoo = async (symbol) => {
  const yahooSymbol = formatSymbol.yahoo(symbol);
  try {
    const data = await yahooFinance.quote(yahooSymbol);
    return {
      source: 'Yahoo',
      price: data.regularMarketPrice,
      change: data.regularMarketChange,
      changePercent: data.regularMarketChangePercent,
      marketCap: data.marketCap,
      peRatio: data.trailingPE,
      dividendYield: data.trailingAnnualDividendYield,
      fiftyTwoWeekRange: `${data.fiftyTwoWeekLow}-${data.fiftyTwoWeekHigh}`
    };
  } catch (error) {
    console.error(`Yahoo failed: ${error.message}`);
    throw error;
  }
};

// Reliable AlphaVantage fetcher
const fetchAlphaVantage = async (symbol) => {
  const alphaSymbol = formatSymbol.alpha(symbol);
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    const data = await response.json();
    
    if (data['Error Message']) throw new Error(data['Error Message']);
    
    const quote = data['Global Quote'] || {};
    return {
      source: 'AlphaVantage',
      price: parseFloat(quote['05. price'] || 0),
      change: parseFloat(quote['09. change'] || 0),
      changePercent: parseFloat((quote['10. change percent'] || '0%').replace('%', '')),
      marketCap: quote['06. volume'] ? `${quote['06. volume']} shares` : 'N/A',
      peRatio: 'N/A', // Not provided in Global Quote
      dividendYield: 'N/A',
      fiftyTwoWeekRange: 'N/A'
    };
  } catch (error) {
    console.error(`AlphaVantage failed: ${error.message}`);
    throw error;
  }
};

// Main data fetcher
const fetchStockData = async (symbol) => {
  const sources = [
    { name: 'Yahoo', fetcher: fetchYahoo },
    { name: 'AlphaVantage', fetcher: fetchAlphaVantage }
  ];

  for (const source of sources) {
    try {
      const data = await source.fetcher(symbol);
      if (data.price && data.price > 0) {
        console.log(`✅ Success with ${source.name} for ${symbol}`);
        return { ...data, symbol };
      }
    } catch (error) {
      console.warn(`⚠️ ${source.name} failed: ${error.message}`);
    }
  }
  
  throw new Error('All data sources failed');
};

// Final API endpoint
const getLivePrice = async (req, res) => {
  const { symbol } = req.params;
  
  try {
    const data = await fetchStockData(symbol);
    res.json({
      success: true,
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      suggestion: 'Try symbols like RELIANCE.BSE, TCS.NS or without exchange suffix'
    });
  }
};

module.exports = { getLivePrice };