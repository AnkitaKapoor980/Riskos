const axios = require("axios");

const calculateRiskMetrics = async (req, res) => {
    try {
        const portfolio = req.body.portfolio;

        // Send portfolio data to Flask API for risk calculation
        const response = await axios.post("http://127.0.0.1:5000/calculate-risk", {
            portfolio: portfolio
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Risk calculation failed", error: error.message });
    }
};

module.exports = { calculateRiskMetrics };
