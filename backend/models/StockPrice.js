const mongoose = require("mongoose");

const stockPriceSchema = new mongoose.Schema(
    {
        symbol: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        change: {
            type: Number,
            required: true
        },
        percentChange: {
            type: Number,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }
);

module.exports = mongoose.model("StockPrice", stockPriceSchema);
