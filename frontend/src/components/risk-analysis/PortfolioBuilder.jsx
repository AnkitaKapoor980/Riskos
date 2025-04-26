import React, { useState } from 'react';
import {
  Card, CardContent, Typography, Grid, Paper,
  Button, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';

const PortfolioBuilder = ({ availableStocks, portfolio, setPortfolio, setError }) => {
  const [stockSymbol, setStockSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');

  const addStockToPortfolio = () => {
    if (!stockSymbol || !quantity || !buyPrice) {
      setError('Please fill all fields');
      return;
    }

    setPortfolio([...portfolio, {
      symbol: stockSymbol,
      quantity: parseInt(quantity),
      buyPrice: parseFloat(buyPrice)
    }]);

    setStockSymbol('');
    setQuantity('');
    setBuyPrice('');
    setError('');
  };

  const removeStock = (index) => {
    const updatedPortfolio = [...portfolio];
    updatedPortfolio.splice(index, 1);
    setPortfolio(updatedPortfolio);
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Build Your Portfolio
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Stock Symbol</InputLabel>
              <Select
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value)}
                label="Stock Symbol"
              >
                {availableStocks.map((stock) => (
                  <MenuItem key={stock.symbol} value={stock.symbol}>
                    {stock.symbol} - {stock.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Buy Price (₹)"
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={addStockToPortfolio}
              sx={{ height: '56px' }}
            >
              Add Stock
            </Button>
          </Grid>
        </Grid>
      </CardContent>

      {portfolio.length > 0 && (
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Portfolio
          </Typography>
          <Grid container spacing={2}>
            {portfolio.map((stock, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <Typography><strong>{stock.symbol}</strong></Typography>
                    <Typography>Qty: {stock.quantity}</Typography>
                    <Typography>Buy Price: ₹{stock.buyPrice.toFixed(2)}</Typography>
                  </div>
                  <Button
                    color="error"
                    onClick={() => removeStock(index)}
                  >
                    Remove
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      )}
    </Card>
  );
};

export default PortfolioBuilder;