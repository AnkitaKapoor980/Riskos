const express = require("express");
const router = express.Router();
const { calculateRiskMetrics } = require("../controllers/riskController");

router.post("/calculate", calculateRiskMetrics);

module.exports = router;
