const path = require('path');
const fs = require('fs');
const { PythonShell } = require('python-shell');
const RiskResult = require('../models/RiskResult');
const User = require('../models/User');

const analyzePortfolio = async (req, res) => {
    try {
        const { portfolioStocks, forecastDays, confidenceLevel } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!portfolioStocks || Object.keys(portfolioStocks).length === 0) {
            return res.status(400).json({ error: 'Portfolio stocks are required' });
        }

        // Create temp directory
        const tempDir = path.join(__dirname, '../temp_analysis');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Prepare input data
        const inputData = {
            portfolioStocks,
            forecastDays: forecastDays || 30,
            confidenceLevel: confidenceLevel || 0.95,
            userId
        };

        // Save input to JSON file
        const inputFilePath = path.join(tempDir, `input_${Date.now()}.json`);
        fs.writeFileSync(inputFilePath, JSON.stringify(inputData));

        // Python script configuration
        const options = {
            mode: 'text',
            pythonPath: process.env.PYTHON_PATH || 'python3',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, '../ml_scripts'),
            args: [inputFilePath]
        };

        // Execute Python script
        PythonShell.run('portfolio_prediction.py', options, async (err, results) => {
            if (err) {
                console.error('Python script error:', err);
                return res.status(500).json({ 
                    error: 'Prediction analysis failed',
                    details: err.message 
                });
            }

            try {
                // Get output file path
                const outputPath = path.join(tempDir, results[0].trim());
                const predictionResults = JSON.parse(fs.readFileSync(outputPath, 'utf8'));

                // Save results to MongoDB
                const riskResult = new RiskResult({
                    user: userId,
                    analysisDate: new Date(),
                    portfolioValue: predictionResults.portfolio_summary['Total Portfolio Value'],
                    profitLoss: predictionResults.portfolio_summary['Total Profit/Loss'],
                    varAmount: predictionResults.portfolio_summary['Value at Risk (VaR)'],
                    cvarAmount: predictionResults.portfolio_summary['Conditional VaR (CVaR)'],
                    sharpeRatio: predictionResults.portfolio_summary['Sharpe Ratio'],
                    maxDrawdown: predictionResults.portfolio_summary['Maximum Drawdown'],
                    riskLevel: predictionResults.portfolio_summary['Risk Level'],
                    recommendation: predictionResults.portfolio_summary['Recommendation'],
                    stocks: Object.keys(predictionResults.individual_stocks).map(symbol => ({
                        symbol,
                        ...predictionResults.individual_stocks[symbol]
                    })),
                    visualizationPaths: predictionResults.visualization_paths
                });

                await riskResult.save();

                // Update user's last analysis date
                await User.findByIdAndUpdate(userId, { 
                    $set: { lastAnalysisDate: new Date() } 
                });

                // Clean up
                fs.unlinkSync(inputFilePath);
                fs.unlinkSync(outputPath);

                res.json({
                    success: true,
                    results: predictionResults,
                    savedResultId: riskResult._id
                });
            } catch (parseError) {
                console.error('Error processing results:', parseError);
                res.status(500).json({ 
                    error: 'Failed to process prediction results',
                    details: parseError.message 
                });
            }
        });
    } catch (error) {
        console.error('Error in prediction analysis:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};

const getPredictionResult = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await RiskResult.findById(id);

        if (!result) {
            return res.status(404).json({ error: 'Prediction result not found' });
        }

        if (result.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error fetching prediction result:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getUserPredictionHistory = async (req, res) => {
    try {
        const results = await RiskResult.find({ user: req.user.id })
            .sort({ analysisDate: -1 })
            .select('analysisDate portfolioValue profitLoss riskLevel recommendation');

        res.json(results);
    } catch (error) {
        console.error('Error fetching prediction history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getPredictionVisualization = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../portfolio_analysis_outputs', filename);
        
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({ error: 'Visualization not found' });
        }
    } catch (error) {
        console.error('Error serving visualization:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    analyzePortfolio,
    getPredictionResult,
    getUserPredictionHistory,
    getPredictionVisualization
};