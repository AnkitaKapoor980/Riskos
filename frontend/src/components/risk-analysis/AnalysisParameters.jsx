import { Card, CardContent, Typography, Grid, Button, TextField } from '@mui/material';
import { CircularProgress } from '@mui/material';

const AnalysisParameters = ({ 
  forecastDays, 
  setForecastDays, 
  confidenceLevel, 
  setConfidenceLevel, 
  analyzePortfolio, 
  isAnalyzing, 
  portfolio 
}) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Analysis Parameters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Forecast Horizon (days)"
              type="number"
              value={forecastDays}
              onChange={(e) => setForecastDays(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Confidence Level (%)"
              type="number"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(e.target.value)}
              inputProps={{ min: 80, max: 99 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={analyzePortfolio}
              disabled={isAnalyzing || portfolio.length === 0}
              startIcon={isAnalyzing ? <CircularProgress size={20} /> : null}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Portfolio Risk'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AnalysisParameters;