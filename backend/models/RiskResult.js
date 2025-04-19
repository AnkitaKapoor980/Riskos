const mongoose = require("mongoose");

const riskResultSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    type: {
      type: String,
      enum: ["calculate", "predict"],
      required: true
    },
    input: {
      symbols: [String],
      quantities: [Number],
      buyPrices: [Number],
      predictionMonths: Number
    },
    output: {
      var: Number,
      cvar: Number,
      sharpeRatio: Number,
      maxDrawdown: Number,
      monteCarlo: {
        meanReturn: Number,
        stdDeviation: Number
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

module.exports = mongoose.model("RiskResult", riskResultSchema);
