// backend/models/portfolio.js
const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    stocks: [{
        symbol: { type: String, required: true },
        quantity: { type: Number, required: true },
        buyPrice: { type: Number, required: true },
        currentPrice: { type: Number },
        sector: { type: String }
    }],
    riskMetrics: {
        var: { type: Number },
        cvar: { type: Number },
        sharpeRatio: { type: Number },
        forecastedVar: {type: Number},
        forecastedCVar: { type: Number},
        volatality: {type: Number},
        expectedReturn: {type: Number}
    }
}, { timestamps: true });

module.exports = mongoose.model('Portfolio', portfolioSchema);
