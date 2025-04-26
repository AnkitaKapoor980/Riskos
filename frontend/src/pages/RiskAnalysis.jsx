import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Typography from '@mui/material/Typography';
import {
  Container,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

import PortfolioBuilder from '../components/risk-analysis/PortfolioBuilder';
import PortfolioSummary from '../components/risk-analysis/PortfolioSummary';
import StockAnalysis from '../components/risk-analysis/StockAnalysis';
import RiskVisualizations from '../components/risk-analysis/RiskVisualizations';
import PredictionHistory from '../components/risk-analysis/PredictionHistory';
import AnalysisParameters from '../components/risk-analysis/AnalysisParameters';

const RiskAnalysisPage = () => {
  const { currentUser } = useAuth();
  const [portfolio, setPortfolio] = useState([]);
  const [forecastDays, setForecastDays] = useState(30);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState('');
  const [availableStocks, setAvailableStocks] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

  const fetchAvailableStocks = async () => {
    try {
      const response = await axios.get('/api/market/available-stocks');
      setAvailableStocks(response.data);
    } catch (err) {
      console.error('Error fetching available stocks:', err);
    }
  };

  const fetchPredictionHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/predictions/history');
      setPredictionHistory(response.data);
    } catch (err) {
      console.error('Error fetching prediction history:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchAvailableStocks();
      fetchPredictionHistory();
    }
  }, [currentUser]);

  const analyzePortfolio = async () => {
    if (portfolio.length === 0) {
      setError('Please add at least one stock to analyze');
      return;
    }
  
    setIsAnalyzing(true);
    setError('');
  
    try {
      const portfolioStocks = {};
      portfolio.forEach(stock => {
        portfolioStocks[stock.symbol] = {
          quantity: stock.quantity,
          buy_price: stock.buyPrice
        };
      });
  
      const response = await axios.post('http://localhost:5000/api/predictions/analyze', {
        portfolioStocks,
        forecastDays,
        confidenceLevel: confidenceLevel / 100
      });
      setAnalysisResults(response.data.results);
    } catch (err) {
      console.error('Error analyzing portfolio:', err);
      setError(err.response?.data?.error || 'Failed to analyze portfolio');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSavedResult = async (resultId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/predictions/result/${resultId}`);
      setSelectedResult(response.data);
      
      const transformedResults = {
        portfolio_summary: {
          'Total Portfolio Value': response.data.portfolioValue,
          'Total Profit/Loss': response.data.profitLoss,
          'Portfolio Return': calculateReturn(response.data),
          'Value at Risk (VaR)': response.data.varAmount,
          'Conditional VaR (CVaR)': response.data.cvarAmount,
          'Sharpe Ratio': response.data.sharpeRatio,
          'Maximum Drawdown': response.data.maxDrawdown,
          'Risk Level': response.data.riskLevel,
          'Recommendation': response.data.recommendation
        },
        individual_stocks: response.data.stocks.reduce((acc, stock) => {
          acc[stock.symbol] = {
            'Position Value': stock.positionValue,
            'Weight': stock.weight,
            'Profit/Loss': stock.profitLoss,
            'ROI': stock.roi,
            'Risk Metrics': {
              'VaR': stock.varAmount,
              'CVaR': stock.cvarAmount,
              'Sharpe Ratio': stock.sharpeRatio,
              'Maximum Drawdown': stock.maxDrawdown
            },
            'Forecast': stock.forecast ? {
              'Expected Return': stock.forecast.expectedReturn,
              'Recommendation': stock.forecast.recommendation
            } : undefined
          };
          return acc;
        }, {})
      };
      
      setAnalysisResults(transformedResults);
    } catch (err) {
      console.error('Error loading saved result:', err);
      setError('Failed to load saved analysis');
    }
  };

  const calculateReturn = (result) => {
    const portfolioValue = parseFloat(result.portfolioValue.replace(/[^0-9.-]+/g, ''));
    const profitLoss = parseFloat(result.profitLoss.replace(/[^0-9.-]+/g, ''));
    return `${((profitLoss / (portfolioValue - profitLoss)) * 100).toFixed(2)}%`;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Portfolio Risk Analysis
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <PredictionHistory 
        predictionHistory={predictionHistory} 
        loadSavedResult={loadSavedResult} 
        selectedResult={selectedResult}
      />

      <PortfolioBuilder 
        availableStocks={availableStocks}
        portfolio={portfolio}
        setPortfolio={setPortfolio}
        setError={setError}
      />

      <AnalysisParameters 
        forecastDays={forecastDays}
        setForecastDays={setForecastDays}
        confidenceLevel={confidenceLevel}
        setConfidenceLevel={setConfidenceLevel}
        analyzePortfolio={analyzePortfolio}
        isAnalyzing={isAnalyzing}
        portfolio={portfolio}
      />

      {isAnalyzing && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Analyzing portfolio risk...</Typography>
        </Box>
      )}

      {analysisResults && (
        <>
          <PortfolioSummary summary={analysisResults.portfolio_summary} />
          <StockAnalysis stocks={analysisResults.individual_stocks} />
          <RiskVisualizations stocks={analysisResults.individual_stocks} />
        </>
      )}
    </Container>
  );
};

export { RiskAnalysisPage};