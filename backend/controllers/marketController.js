const getMarketSummary = async (req, res) => {
    try {
        const data = {
            nifty50: {
                index: "NIFTY 50",
                current: 22350.25,
                change: -120.5,
                percentChange: -0.54
            },
            sensex: {
                index: "SENSEX",
                current: 73800.10,
                change: -210.7,
                percentChange: -0.28
            }
        };

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching market summary", error: error.message });
    }
};

const getStockPrice = async (req, res) => {
    try {
        const { symbol } = req.params;

        const price = (Math.random() * 1000 + 100).toFixed(2);
        const change = (Math.random() * 10 - 5).toFixed(2);
        const percentChange = ((change / price) * 100).toFixed(2);

        res.json({
            symbol,
            price: Number(price),
            change: Number(change),
            percentChange: Number(percentChange)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stock price", error: error.message });
    }
};

module.exports = { getMarketSummary, getStockPrice };
