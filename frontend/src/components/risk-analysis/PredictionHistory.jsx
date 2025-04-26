import { Card, CardContent, Typography, Grid } from '@mui/material';

const PredictionHistory = ({ predictionHistory, loadSavedResult, selectedResult }) => {
  if (predictionHistory.length === 0) return null;

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Your Prediction History
        </Typography>
        <Grid container spacing={2}>
          {predictionHistory.map((result) => (
            <Grid item xs={12} sm={6} md={4} key={result._id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedResult?._id === result._id ? '2px solid #1976d2' : '1px solid #ddd'
                }}
                onClick={() => loadSavedResult(result._id)}
              >
                <CardContent>
                  <Typography variant="subtitle1">
                    {new Date(result.analysisDate).toLocaleDateString()}
                  </Typography>
                  <Typography>Value: {result.portfolioValue}</Typography>
                  <Typography>P/L: {result.profitLoss}</Typography>
                  <Typography color={
                    result.riskLevel.includes('High') ? 'error' : 
                    result.riskLevel.includes('Moderate') ? 'warning' : 'success'
                  }>
                    Risk: {result.riskLevel}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PredictionHistory;