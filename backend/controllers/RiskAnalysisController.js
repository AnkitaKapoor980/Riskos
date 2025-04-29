const axios = require("axios");
const PredictionResult = require("../models/PredictionResult");
const path = require("path");

// =================== MARKET CONTROLLER SECTION ===================
const getPrice = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const nseSymbol = symbol.endsWith(".NS") ? symbol : `${symbol}.NS`;

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${nseSymbol}?interval=1d&range=1d`;

    const response = await axios.get(url);
    const data = response.data;

    const result = data.chart.result[0];
    const price = result.meta.regularMarketPrice;

    res.json({ symbol, price });
  } catch (error) {
    console.error("Error fetching price:", error.message);
    res.status(500).json({ error: "Failed to fetch price." });
  }
};

// =================== RISK CONTROLLER SECTION ===================
const calculateRisk = async (req, res) => {
  console.log("Received request in Express:", req.body);

  try {
    const flaskUrl = "http://localhost:5002/calculate-risk";
    const response = await axios.post(flaskUrl, req.body);

    console.log("Flask response data:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error in risk calculation:", error.message);
    if (error.response) {
      console.error("Flask error response:", error.response.data);
    }
    res.status(500).json({ error: "Something went wrong while calculating risk." });
  }
};

// =================== PREDICTION CONTROLLER SECTION ===================
const analyzePortfolio = async (req, res) => {
  try {
    const flaskUrl = "http://localhost:5002/analyze";
    const response = await axios.post(flaskUrl, req.body);

    const result = response.data;
    const newPrediction = new PredictionResult({
      user: req.user._id,
      input: req.body,
      result,
      visualization: result.visualization || null,
    });

    const saved = await newPrediction.save();
    res.json(saved);
  } catch (error) {
    console.error("Prediction error:", error.message);
    res.status(500).json({ error: "Failed to analyze portfolio" });
  }
};

const getPredictionResult = async (req, res) => {
  try {
    const result = await PredictionResult.findOne({ _id: req.params.id, user: req.user._id });
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (error) {
    console.error("Get result error:", error.message);
    res.status(500).json({ error: "Failed to retrieve result" });
  }
};

const getUserPredictionHistory = async (req, res) => {
  try {
    const history = await PredictionResult.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error("History error:", error.message);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

const getPredictionVisualization = (req, res) => {
  const filePath = path.join(__dirname, "../flask-api/outputs", req.params.filename);
  res.sendFile(filePath);
};

module.exports = {
  getPrice,
  calculateRisk,
  analyzePortfolio,
  getPredictionResult,
  getUserPredictionHistory,
  getPredictionVisualization,
};
