const riskMetricSchema = new mongoose.Schema({
    portfolio: { type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' },
    volatility: Number,
    sharpeRatio: Number,
    valueAtRisk: Number,
  });
  