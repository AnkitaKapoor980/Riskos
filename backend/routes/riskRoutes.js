const express = require("express");
const router = express.Router();
const axios = require("axios");

router.options("/calculate", (req, res) => {
  res.sendStatus(200);
});

router.post("/calculate", async (req, res) => {
  console.log("Received request in Express:", req.body);

  try {
    const flaskUrl = "http://localhost:5002/calculate-risk"; // Use Flask port!
    const response = await axios.post(flaskUrl, req.body);
    console.log("Flask response data:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Error in riskRoutes:", error.message);
    if (error.response) {
      console.error("Flask error response:", error.response.data);
    }
    res.status(500).json({ error: "Something went wrong while calculating risk. Check backend logs." });
  }
});

module.exports = router;
