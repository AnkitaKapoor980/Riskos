import { Card, CardContent, Typography, Grid } from '@mui/material';

const PortfolioSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Portfolio Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography><strong>Total Value:</strong> {summary['Total Portfolio Value']}</Typography>
            <Typography><strong>Profit/Loss:</strong> {summary['Total Profit/Loss']}</Typography>
            <Typography><strong>Return:</strong> {summary['Portfolio Return']}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography><strong>Risk Level:</strong> {summary['Risk Level']}</Typography>
            <Typography><strong>VaR (95%):</strong> {summary['Value at Risk (VaR)']}</Typography>
            <Typography><strong>CVaR (95%):</strong> {summary['Conditional VaR (CVaR)']}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Recommendation:</strong> {summary['Recommendation']}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;