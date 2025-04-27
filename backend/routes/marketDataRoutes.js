const express = require('express');
const router = express.Router();
const marketDataController = require('../controllers/marketDataController');

// Route to get stocks by category (most-active, trending-now, top-gainers, top-losers)
router.get('/stocks/:category', marketDataController.getStocksByCategory);

// Route to search stocks
router.get('/search', marketDataController.searchStocks);

// Route to get stock details by symbol
router.get('/stock/:symbol', marketDataController.getStockDetails);

router.get('/test', (req, res) => {
    res.json({ message: 'Market data routes are working!' });
  });
  

module.exports = router;