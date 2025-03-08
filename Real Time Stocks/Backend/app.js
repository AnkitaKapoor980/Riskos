const axios = require("axios");
const { google } = require("googleapis");
const fs = require("fs");
require("dotenv").config();

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// List of NIFTY 50 Stock Symbols (NSE Suffix)
const NIFTY_50_SYMBOLS = [
  "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
  "HINDUNILVR.NS", "SBIN.NS", "BHARTIARTL.NS", "ADANIENT.NS", "ITC.NS"
];

// Google Sheets Authentication
const authenticateGoogle = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient });
};

// Function to Update Google Sheet
const updateGoogleSheet = async (rows) => {
  const sheets = await authenticateGoogle();

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Sheet1!A1:E1", // Update range
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          ["Stock Symbol", "Current Price", "Day Change", "Percent Change", "Last Updated"],
          ...rows,
        ],
      },
    });
    console.log("Google Sheet updated successfully!");
  } catch (error) {
    console.error("Error updating Google Sheet:", error);
  }
};

// Function to Fetch Stock Data
const fetchStockData = async () => {
  const rows = [];

  for (const symbol of NIFTY_50_SYMBOLS) {
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`;

    try {
      const { data } = await axios.get(url);

      rows.push([
        symbol,
        data.c, // Current Price
        data.d, // Day Change
        data.dp, // Percent Change
        new Date(data.t * 1000).toLocaleString(), // Last Updated (timestamp to date)
      ]);
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error.message);
    }
  }

  return rows;
};

// Main Function
const main = async () => {
  console.log("Starting real-time stock tracking...");

  let previousData = null;

  setInterval(async () => {
    const stockData = await fetchStockData();

    // Compare with Previous Data to Detect Changes
    if (JSON.stringify(stockData) !== JSON.stringify(previousData)) {
      console.log("Stock data changed, updating Google Sheet...");
      await updateGoogleSheet(stockData);
      previousData = stockData;
    } else {
      console.log("No change in stock data.");
    }
  }, 10000); // Check every 10 seconds
};

// Start the Application
main();
