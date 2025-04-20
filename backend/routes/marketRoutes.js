// routes/marketRoutes.js
const express = require("express");
const { getPrice } = require("../controllers/marketController"); // Import the getPrice function

const router = express.Router();

// Route to get stock price
router.get("/price/:symbol", getPrice); // Use getPrice from marketController

// Route to get Nifty50 market summary (already set up)
router.get("/nifty50", async (req, res) => {
    try {
        const apiUrl = "https://api.example.com/market/nifty50";  // Replace with your real API URL

        // Call to the external API to get the Nifty50 data
        const response = await axios.get(apiUrl);

        // Send the Nifty50 data as response
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch market summary", error: error.message });
    }
});

module.exports = router;
