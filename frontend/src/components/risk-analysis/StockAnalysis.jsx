import { Card, CardContent, Typography, Grid } from '@mui/material';

const StockAnalysis = ({ stocks }) => {
  if (!stocks) return null;

  return Object.entries(stocks).map(([symbol, data]) => (
    <Card key={symbol} sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {symbol} Analysis
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Typography><strong>Position Value:</strong> {data['Position Value']}</Typography>
            <Typography><strong>Weight:</strong> {data['Weight']}</Typography>
            <Typography><strong>Profit/Loss:</strong> {data['Profit/Loss']}</Typography>
            <Typography><strong>ROI:</strong> {data['ROI']}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography><strong>VaR:</strong> {data['Risk Metrics']['VaR']}</Typography>
            <Typography><strong>CVaR:</strong> {data['Risk Metrics']['CVaR']}</Typography>
            <Typography><strong>Sharpe Ratio:</strong> {data['Risk Metrics']['Sharpe Ratio']}</Typography>
            <Typography><strong>Max Drawdown:</strong> {data['Risk Metrics']['Maximum Drawdown']}</Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            {data['Forecast'] && (
              <>
                <Typography><strong>Expected Return:</strong> {data['Forecast']['Expected Return']}</Typography>
                <Typography><strong>Recommendation:</strong> {data['Forecast']['Recommendation']}</Typography>
              </>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  ));
};

export default StockAnalysis;