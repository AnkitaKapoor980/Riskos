const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware'); // Correctly destructuring protect


// Protect all prediction routes
router.use(protect);

// Portfolio prediction endpoints
router.post('/analyze', predictionController.analyzePortfolio);
router.get('/result/:id', predictionController.getPredictionResult);
router.get('/history', predictionController.getUserPredictionHistory);
router.get('/visualizations/:filename', predictionController.getPredictionVisualization);

module.exports = router;
