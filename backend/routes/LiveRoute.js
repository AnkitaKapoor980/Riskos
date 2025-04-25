const express = require("express");
const { getLivePrice } = require("../controllers/LiveMarketController");
const router = express.Router();

// Unified endpoint
router.get("/price/:symbol", getLivePrice);

module.exports = router;