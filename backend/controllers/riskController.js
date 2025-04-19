const axios = require("axios");

const calculateRisk = async (req, res) => {
    try {
        const response = await axios.post(`${process.env.FLASK_API_URL}/calculate-risk`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error calculating risk metrics", error: error.message });
    }
};

const predictRisk = async (req, res) => {
    try {
        const response = await axios.post(`${process.env.FLASK_API_URL}/predict-risk`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error predicting risk metrics", error: error.message });
    }
};

module.exports = { calculateRisk, predictRisk };
