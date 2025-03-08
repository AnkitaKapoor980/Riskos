import fetch from "node-fetch";
import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import yahooFinance from 'yahoo-finance2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'api.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const validateEnv = () => {
    const requiredVars = ['GOOGLE_SHEET_ID', 'TIINGO_API_KEY'];
    requiredVars.forEach(varName => {
        if (!process.env[varName]) {
            throw new Error(`Missing required environment variable: ${varName}`);
        }
    });
};

const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const TIINGO_API_KEY = process.env.TIINGO_API_KEY;

const symbols = [
    { display: "RELIANCE.BSE", yahoo: "RELIANCE.BO", tiingo: "RELIANCE" },
    { display: "TCS.BSE", yahoo: "TCS.BO", tiingo: "TCS" },
    { display: "INFY.BSE", yahoo: "INFY.BO", tiingo: "INFY" },
    { display: "HDFCBANK.BSE", yahoo: "HDFCBANK.BO", tiingo: "HDFCBANK" }
];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const formatNumber = (num) => {
    if (typeof num === 'number') {
        return num.toLocaleString('en-IN', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
        });
    }
    return num;
};

const formatMarketCap = (value) => {
    if (typeof value !== 'number') return 'N/A';
    if (value >= 1e12) return `${(value/1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value/1e9).toFixed(2)}B`;
    return value.toLocaleString('en-IN');
};

const formatPercent = (value) => {
    if (typeof value === 'number') return `${value.toFixed(2)}%`;
    return 'N/A';
};

const fetchYahoo = async (symbolObj) => {
    console.log(`[Yahoo] Fetching ${symbolObj.display}`);
    await delay(1000 + Math.random() * 2000);
    const data = await yahooFinance.quote(symbolObj.yahoo);
    
    return {
        source: 'Yahoo',
        symbol: symbolObj.display,
        open: data.regularMarketOpen,
        high: data.regularMarketDayHigh,
        low: data.regularMarketDayLow,
        price: data.regularMarketPrice,
        volume: data.regularMarketVolume,
        previousClose: data.regularMarketPreviousClose,
        change: data.regularMarketChange,
        changePercent: data.regularMarketChangePercent * 100, // Convert to percentage
        marketCap: data.marketCap,
        peRatio: data.trailingPE,
        dividendYield: data.dividendYield ? data.dividendYield * 100 : null, // Convert to percentage
        fiftyTwoWeekHigh: data.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: data.fiftyTwoWeekLow
    };
};

const fetchTiingo = async (symbolObj) => {
    console.log(`[Tiingo] Fallback for ${symbolObj.display}`);
    await delay(1000 + Math.random() * 2000);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const response = await fetch(
        `https://api.tiingo.com/tiingo/daily/${symbolObj.tiingo}/prices?` +
        `startDate=${yesterday.toISOString().split('T')[0]}&` +
        `endDate=${today.toISOString().split('T')[0]}&token=${TIINGO_API_KEY}`
    );

    if (!response.ok) throw new Error(`Tiingo API error: ${response.statusText}`);
    
    const data = await response.json();
    if (!data || data.length < 2) throw new Error('Insufficient Tiingo data');
    
    const prevDay = data[0];
    const currentDay = data[1];
    
    return {
        source: 'Tiingo',
        symbol: symbolObj.display,
        open: currentDay.open,
        high: currentDay.high,
        low: currentDay.low,
        price: currentDay.close,
        volume: currentDay.volume,
        previousClose: prevDay.close,
        change: currentDay.close - prevDay.close,
        changePercent: ((currentDay.close - prevDay.close) / prevDay.close) * 100,
        marketCap: null,
        peRatio: null,
        dividendYield: null,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null
    };
};

const fetchAlphaVantage = async (symbolObj) => {
    console.log(`[AlphaVantage] Final fallback for ${symbolObj.display}`);
    await delay(1000 + Math.random() * 2000);
    
    const response = await fetch(
        `https://www.alphavantage.co/query?` +
        `function=GLOBAL_QUOTE&` +
        `symbol=${symbolObj.display}&` +
        `apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) throw new Error(`AlphaVantage API error: ${response.statusText}`);
    
    const data = await response.json();
    if (data.Note) throw new Error('AlphaVantage rate limit reached');
    
    const quote = data["Global Quote"];
    if (!quote) throw new Error('No AlphaVantage data');
    
    return {
        source: 'AlphaVantage',
        symbol: quote["01. symbol"],
        open: parseFloat(quote["02. open"]),
        high: parseFloat(quote["03. high"]),
        low: parseFloat(quote["04. low"]),
        price: parseFloat(quote["05. price"]),
        volume: parseInt(quote["06. volume"]),
        previousClose: parseFloat(quote["08. previous close"]),
        change: parseFloat(quote["09. change"]),
        changePercent: parseFloat(quote["10. change percent"]?.replace('%', '') || 0),
        marketCap: null,
        peRatio: null,
        dividendYield: null,
        fiftyTwoWeekHigh: null,
        fiftyTwoWeekLow: null
    };
};

const fetchStockData = async (symbolObj) => {
    try {
        return await fetchYahoo(symbolObj);
    } catch (yahooError) {
        console.error(`Yahoo failed: ${yahooError.message}`);
        try {
            return await fetchTiingo(symbolObj);
        } catch (tiingoError) {
            console.error(`Tiingo failed: ${tiingoError.message}`);
            try {
                return await fetchAlphaVantage(symbolObj);
            } catch (alphaError) {
                console.error(`All sources failed: ${alphaError.message}`);
                return {
                    source: 'Error',
                    symbol: symbolObj.display,
                    error: 'All API sources failed',
                    open: 'N/A',
                    high: 'N/A',
                    low: 'N/A',
                    price: 'N/A',
                    volume: 'N/A',
                    previousClose: 'N/A',
                    change: 'N/A',
                    changePercent: 'N/A',
                    marketCap: 'N/A',
                    peRatio: 'N/A',
                    dividendYield: 'N/A',
                    fiftyTwoWeekHigh: 'N/A',
                    fiftyTwoWeekLow: 'N/A'
                };
            }
        }
    }
};

const updateSheet = async () => {
    try {
        validateEnv();

        const headerCheck = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: "Sheet1!A1:Z1",
        });

        if (!headerCheck.data.values) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: "Sheet1!A1:O1",
                valueInputOption: "USER_ENTERED",
                requestBody: {
                    values: [[
                        "Timestamp", "Symbol", "Source", "Open", "High", "Low",
                        "Current Price", "Volume", "Previous Close", "Change",
                        "Change %", "Market Cap", "P/E Ratio", "Dividend Yield",
                        "52W Range"
                    ]]
                }
            });
        }

        console.log("Starting data fetch...");
        const timestamp = new Date().toISOString();

        for (const symbol of symbols) {
            try {
                const data = await fetchStockData(symbol);
                console.log(`Fetched ${symbol.display} from ${data.source}`);

                const row = [
                    timestamp,
                    data.symbol,
                    data.source,
                    formatNumber(data.open),
                    formatNumber(data.high),
                    formatNumber(data.low),
                    formatNumber(data.price),
                    typeof data.volume === 'number' ? data.volume.toLocaleString('en-IN') : 'N/A',
                    formatNumber(data.previousClose),
                    formatNumber(data.change),
                    formatPercent(data.changePercent),
                    formatMarketCap(data.marketCap),
                    data.peRatio ? formatNumber(data.peRatio) : 'N/A',
                    data.dividendYield ? formatPercent(data.dividendYield) : 'N/A',
                    (data.fiftyTwoWeekLow && data.fiftyTwoWeekHigh) 
                        ? `${formatNumber(data.fiftyTwoWeekLow)}-${formatNumber(data.fiftyTwoWeekHigh)}`
                        : 'N/A'
                ];

                await sheets.spreadsheets.values.append({
                    spreadsheetId: SPREADSHEET_ID,
                    range: "Sheet1",
                    valueInputOption: "USER_ENTERED",
                    insertDataOption: "INSERT_ROWS",
                    requestBody: { values: [row] }
                });

                console.log(`Appended data for ${symbol.display}`);
            } catch (error) {
                console.error(`Error processing ${symbol.display}:`, error.message);
            }
            await delay(2000);
        }

        console.log("Data append complete");
    } catch (error) {
        console.error("Sheet update error:", error.message);
    }
};

app.get('/api/stock/:symbol', async (req, res) => {
    try {
        const requestedSymbol = req.params.symbol;
        const symbolObj = symbols.find(s => 
            s.display === requestedSymbol || 
            s.yahoo === requestedSymbol || 
            s.tiingo === requestedSymbol
        );

        if (!symbolObj) {
            return res.status(404).json({ error: 'Symbol not found' });
        }

        const data = await fetchStockData(symbolObj);
        res.json({
            symbol: data.symbol,
            price: data.price,
            change: data.change,
            changePercent: data.changePercent,
            source: data.source,
            timestamp: new Date().toISOString(),
            marketCap: formatMarketCap(data.marketCap),
            peRatio: data.peRatio ? formatNumber(data.peRatio) : 'N/A',
            dividendYield: data.dividendYield ? formatPercent(data.dividendYield) : 'N/A',
            fiftyTwoWeekRange: (data.fiftyTwoWeekLow && data.fiftyTwoWeekHigh) 
                ? `${formatNumber(data.fiftyTwoWeekLow)}-${formatNumber(data.fiftyTwoWeekHigh)}`
                : 'N/A'
        });
    } catch (error) {
        console.error('API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

const startUpdates = async () => {
    try {
        await updateSheet();
        setInterval(updateSheet, 900000);
    } catch (error) {
        console.error("Initialization failed:", error.message);
    }
};

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    startUpdates();
});