// routes/portfolioRoutes.js
const express = require('express');
const mongoose = require('mongoose'); // Added mongoose import
const Portfolio = require('../models/portfolio');
const router = express.Router();

// POST: Add a new portfolio
router.post('/add', async (req, res) => {
    try {
        // Clone the request body
        const portfolioData = {...req.body};
        
        // Convert the string ID to a MongoDB ObjectId
        if (portfolioData.user) {
            portfolioData.user = new mongoose.Types.ObjectId(portfolioData.user);
        }
        
        // Create and save the portfolio
        const newPortfolio = new Portfolio(portfolioData);
        await newPortfolio.save();
        
        res.status(201).json({ 
            message: 'Portfolio created successfully', 
            portfolio: newPortfolio 
        });
    } catch (err) {
        console.error('Portfolio creation error:', err);
        res.status(500).json({ 
            message: 'Error creating portfolio', 
            error: err.message 
        });
    }
});

// PUT: Update a portfolio
router.put('/:id', async (req, res) => {
    try {
        const updatedPortfolio = await Portfolio.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!updatedPortfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }
        
        res.status(200).json({
            message: 'Portfolio updated successfully',
            portfolio: updatedPortfolio
        });
    } catch (err) {
        console.error('Error updating portfolio:', err);
        res.status(500).json({
            message: 'Error updating portfolio',
            error: err.message
        });
    }
});

// DELETE: Remove a portfolio
router.delete('/:id', async (req, res) => {
    try {
        const deletedPortfolio = await Portfolio.findByIdAndDelete(req.params.id);
        
        if (!deletedPortfolio) {
            return res.status(404).json({ message: 'Portfolio not found' });
        }
        
        res.status(200).json({
            message: 'Portfolio deleted successfully',
            portfolio: deletedPortfolio
        });
    } catch (err) {
        console.error('Error deleting portfolio:', err);
        res.status(500).json({
            message: 'Error deleting portfolio',
            error: err.message
        });
    }
});

module.exports = router;