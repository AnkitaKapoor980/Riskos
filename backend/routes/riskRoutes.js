const express = require("express");
const router = express.Router();
const { calculateRisk, predictRisk } = require("../controllers/riskController");

router.post("/calculate", calculateRisk);
router.post("/predict", predictRisk);

module.exports = router;
