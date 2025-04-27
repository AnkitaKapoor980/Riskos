// routes/marketRoutes.js
const express = require("express");
const { getPrice } = require("../controllers/marketController"); // Import the getPrice function
const { getStockPrice } = require("../controllers/marketController");

const router = express.Router();

// Route to get stock price
router.get("/price/:symbol", getPrice); // Use getPrice from marketController

module.exports = router;