const express = require("express");
const router = express.Router();
const { getStockPrice, getNiftyData } = require("../controllers/marketController");

router.get("/price/:symbol", getStockPrice);

router.get("/nifty50", getNiftyData);

module.exports = router;
