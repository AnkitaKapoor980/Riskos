const axios = require('axios');

// Environment variables
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const TIINGO_API_KEY = process.env.TIINGO_API_KEY;

// Helper function to add .NS suffix to Indian stock symbols if needed
const formatIndianSymbol = (symbol) => {
  if (!symbol.endsWith('.NS') && !symbol.endsWith('.BO')) {
    return `${symbol}.NS`;
  }
  return symbol;
};

// Get stocks by category
exports.getStocksByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let stocks = [];
    
    // Map category to API endpoints
    switch(category) {
      case 'most-active':
        // Use Yahoo Finance API for most active stocks in India
        const response = await axios.get('https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=IN&scrIds=most_actives&count=20');
        
        if (response.data && response.data.finance && response.data.finance.result) {
          const quotes = response.data.finance.result[0].quotes || [];
          
          stocks = quotes.map(quote => ({
            symbol: quote.symbol,
            name: quote.shortName || quote.longName || quote.symbol,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            exchange: quote.exchange || 'NSE'
          }));
        }
        break;
        
      case 'trending-now':
        // Use Alpha Vantage for trending stocks
        const trendingResponse = await axios.get(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`);
        
        if (trendingResponse.data && trendingResponse.data.most_actively_traded) {
          stocks = trendingResponse.data.most_actively_traded.map(item => ({
            symbol: item.ticker,
            name: item.ticker, // Alpha Vantage doesn't provide company names
            price: parseFloat(item.price),
            change: parseFloat(item.change_amount),
            changePercent: parseFloat(item.change_percentage.replace('%', '')),
            volume: parseInt(item.volume),
            exchange: 'NSE'
          }));
        }
        break;
        
      case 'top-gainers':
        // Use Alpha Vantage for top gainers
        const gainersResponse = await axios.get(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`);
        
        if (gainersResponse.data && gainersResponse.data.top_gainers) {
          stocks = gainersResponse.data.top_gainers.map(item => ({
            symbol: item.ticker,
            name: item.ticker, // Alpha Vantage doesn't provide company names
            price: parseFloat(item.price),
            change: parseFloat(item.change_amount),
            changePercent: parseFloat(item.change_percentage.replace('%', '')),
            volume: parseInt(item.volume),
            exchange: 'NSE'
          }));
        }
        break;
        
      case 'top-losers':
        // Use Alpha Vantage for top losers
        const losersResponse = await axios.get(`https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`);
        
        if (losersResponse.data && losersResponse.data.top_losers) {
          stocks = losersResponse.data.top_losers.map(item => ({
            symbol: item.ticker,
            name: item.ticker, // Alpha Vantage doesn't provide company names
            price: parseFloat(item.price),
            change: parseFloat(item.change_amount),
            changePercent: parseFloat(item.change_percentage.replace('%', '')),
            volume: parseInt(item.volume),
            exchange: 'NSE'
          }));
        }
        break;
        
      default:
        return res.status(400).json({ message: 'Invalid category' });
    }
    
    // Filter and enhance stock data
    // For Indian stocks, we might need to do additional processing
    const indianStocks = stocks.filter(stock => 
      stock.symbol.endsWith('.NS') || 
      stock.symbol.endsWith('.BO') || 
      ['NSE', 'BSE'].includes(stock.exchange)
    );
    
    res.json(indianStocks.length > 0 ? indianStocks : stocks);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ message: 'Error fetching stock data', error: error.message });
  }
};

// Search for stocks
exports.searchStocks = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Try Yahoo Finance search API
    const response = await axios.get(`https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false&quotesQueryId=tss_match_phrase_query&region=IN`);
    
    if (response.data && response.data.quotes) {
      // Filter for Indian stocks (NSE or BSE)
      const indianStocks = response.data.quotes.filter(quote => 
        quote.symbol.endsWith('.NS') || 
        quote.symbol.endsWith('.BO') || 
        ['NSE', 'BSE'].includes(quote.exchange)
      );
      
      const results = indianStocks.map(quote => ({
        symbol: quote.symbol,
        name: quote.shortname || quote.longname || quote.symbol,
        exchange: quote.exchange || 'NSE'
      }));
      
      return res.json(results);
    }
    
    // If Yahoo Finance doesn't return results, try Alpha Vantage as fallback
    const alphaResponse = await axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`);
    
    if (alphaResponse.data && alphaResponse.data.bestMatches) {
      // Filter for Indian stocks (NSE or BSE)
      const indianStocks = alphaResponse.data.bestMatches.filter(match => 
        match['4. region'] === 'India' || 
        match['1. symbol'].endsWith('.NS') || 
        match['1. symbol'].endsWith('.BO')
      );
      
      const results = indianStocks.map(match => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        exchange: match['4. region'] === 'India' ? 'NSE' : match['4. region']
      }));
      
      return res.json(results);
    }
    
    // If no results from either API
    return res.json([]);
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({ message: 'Error searching stocks', error: error.message });
  }
};

// Get stock details
exports.getStockDetails = async (req, res) => {
  try {
    const { symbol } = req.params;
    const formattedSymbol = formatIndianSymbol(symbol);
    
    // First try to get details from Yahoo Finance
    try {
      const yahooResponse = await axios.get(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${formattedSymbol}`);
      
      if (yahooResponse.data && yahooResponse.data.quoteResponse && yahooResponse.data.quoteResponse.result && yahooResponse.data.quoteResponse.result.length > 0) {
        const quote = yahooResponse.data.quoteResponse.result[0];
        
        const stockDetails = {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || quote.symbol,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          open: quote.regularMarketOpen || 0,
          high: quote.regularMarketDayHigh || 0,
          low: quote.regularMarketDayLow || 0,
          previousClose: quote.regularMarketPreviousClose || 0,
          volume: quote.regularMarketVolume || 0,
          exchange: quote.exchange || 'NSE',
          marketCap: quote.marketCap || 0,
          pe: quote.trailingPE || null,
          yearHigh: quote.fiftyTwoWeekHigh || 0,
          yearLow: quote.fiftyTwoWeekLow || 0
        };
        
        return res.json(stockDetails);
      }
    } catch (yahooError) {
      console.error('Yahoo Finance API error:', yahooError);
      // Continue to try other APIs
    }
    
    // Try Tiingo API as fallback
    try {
      // For Indian stocks on Tiingo, we need to format the symbol
      const tiingoSymbol = formattedSymbol.replace('.NS', '').replace('.BO', '');
      
      const tiingoResponse = await axios.get(`https://api.tiingo.com/tiingo/daily/${tiingoSymbol}?token=${TIINGO_API_KEY}`);
      
      // Get price data
      const priceResponse = await axios.get(`https://api.tiingo.com/tiingo/daily/${tiingoSymbol}/prices?token=${TIINGO_API_KEY}`);
      
      if (tiingoResponse.data && priceResponse.data && priceResponse.data.length > 0) {
        const priceData = priceResponse.data[0];
        
        const stockDetails = {
          symbol: formattedSymbol,
          name: tiingoResponse.data.name,
          price: priceData.close || 0,
          change: priceData.close - priceData.open || 0,
          changePercent: ((priceData.close - priceData.open) / priceData.open) * 100 || 0,
          open: priceData.open || 0,
          high: priceData.high || 0,
          low: priceData.low || 0,
          previousClose: priceData.prevClose || 0,
          volume: priceData.volume || 0,
          exchange: 'NSE',
          marketCap: tiingoResponse.data.marketCap || 0,
          pe: null, // Tiingo doesn't provide PE ratio
          yearHigh: 0, // Need additional API calls to get this data
          yearLow: 0  // Need additional API calls to get this data
        };
        
        return res.json(stockDetails);
      }
    } catch (tiingoError) {
      console.error('Tiingo API error:', tiingoError);
      // Continue to try Alpha Vantage
    }
    
    // Try Alpha Vantage as last resort
    try {
      const alphaSymbol = formattedSymbol.replace('.NS', '').replace('.BO', '');
      
      const globalQuoteResponse = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
      const overviewResponse = await axios.get(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${alphaSymbol}&apikey=${ALPHA_VANTAGE_API_KEY}`);
      
      if (globalQuoteResponse.data && globalQuoteResponse.data['Global Quote']) {
        const quote = globalQuoteResponse.data['Global Quote'];
        const overview = overviewResponse.data || {};
        
        const stockDetails = {
          symbol: formattedSymbol,
          name: overview.Name || alphaSymbol,
          price: parseFloat(quote['05. price']) || 0,
          change: parseFloat(quote['09. change']) || 0,
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')) || 0,
          open: parseFloat(quote['02. open']) || 0,
          high: parseFloat(quote['03. high']) || 0,
          low: parseFloat(quote['04. low']) || 0,
          previousClose: parseFloat(quote['08. previous close']) || 0,
          volume: parseInt(quote['06. volume']) || 0,
          exchange: 'NSE',
          marketCap: parseFloat(overview.MarketCapitalization) || 0,
          pe: parseFloat(overview.PERatio) || null,
          yearHigh: parseFloat(overview['52WeekHigh']) || 0,
          yearLow: parseFloat(overview['52WeekLow']) || 0
        };
        
        return res.json(stockDetails);
      }
    } catch (alphaError) {
      console.error('Alpha Vantage API error:', alphaError);
    }
    
    // If all APIs fail
    return res.status(404).json({ message: 'Stock details not found' });
  } catch (error) {
    console.error('Error fetching stock details:', error);
    res.status(500).json({ message: 'Error fetching stock details', error: error.message });
  }
};