import numpy as np
import pandas as pd

def verify_risk_metrics(returns, stock_values, confidence_level=0.95, risk_free_rate=0.05):
    verification_results = {}

    for stock in returns.columns:
        stock_returns = returns[stock]
        stock_value = stock_values.get(stock, 1)  # Default 1 if not provided

        # VaR Calculation
        var_threshold = np.percentile(stock_returns, (1 - confidence_level) * 100)
        var_value = var_threshold * stock_value

        # CVaR Calculation
        cvar_value = stock_returns[stock_returns <= var_threshold].mean() * stock_value

        # Sharpe Ratio
        excess_returns = stock_returns.mean() - (risk_free_rate / 252)
        sharpe_ratio = excess_returns / stock_returns.std()

        # Maximum Drawdown
        cumulative_max = (1 + stock_returns).cumprod().cummax()
        drawdown = (1 + stock_returns).cumprod() / cumulative_max - 1
        max_drawdown = drawdown.min()

        verification_results[stock] = {
            "VaR (₹)": round(var_value, 2),
            "CVaR (₹)": round(cvar_value, 2),
            "Sharpe Ratio": round(sharpe_ratio, 2),
            "Max Drawdown": round(max_drawdown, 4)
        }

    return verification_results

# Example Usage:
# Load your existing `returns` DataFrame
# Assuming stock values are stored in a dictionary
stock_values = {
    "ADANIPORTS.NS": 75 * 1240,  # Example: 50 shares at ₹3000 each
    "RELIANCE.NS": 120 * 1386     # Example: 30 shares at ₹2700 each
}

# Call function to verify
verification_results = verify_risk_metrics(returns, stock_values)

# Print verification results
import json
print(json.dumps(verification_results, indent=4))
