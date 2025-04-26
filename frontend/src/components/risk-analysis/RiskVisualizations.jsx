import { Box, Typography, Grid, Paper } from '@mui/material';
import { Pie, Scatter } from 'react-chartjs-2';

const RiskVisualizations = ({ stocks }) => {
  if (!stocks) return null;

  const stockSymbols = Object.keys(stocks);
  const weights = stockSymbols.map(symbol => 
    parseFloat(stocks[symbol]['Weight'].replace('%', ''))
  );
  const riskValues = stockSymbols.map(symbol => 
    parseFloat(stocks[symbol]['Risk Metrics']['VaR'].replace('₹', '').replace(',', ''))
  );
  const returnValues = stockSymbols.map(symbol => 
    parseFloat(stocks[symbol]['ROI'].replace('%', ''))
  );

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Visualizations
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Portfolio Composition
            </Typography>
            <Box height={300}>
              <Pie
                data={{
                  labels: stockSymbols,
                  datasets: [{
                    data: weights,
                    backgroundColor: [
                      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                      '#9966FF', '#FF9F40'
                    ]
                  }]
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Risk vs Return
            </Typography>
            <Box height={300}>
              <Scatter
                data={{
                  datasets: [{
                    label: 'Stocks',
                    data: stockSymbols.map((symbol, i) => ({
                      x: riskValues[i],
                      y: returnValues[i],
                      symbol
                    })),
                    backgroundColor: '#36A2EB'
                  }]
                }}
                options={{
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const data = context.raw;
                          return `${data.symbol}: ₹${data.x.toLocaleString()} VaR, ${data.y}% ROI`;
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Risk (VaR in ₹)'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Return (%)'
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskVisualizations;