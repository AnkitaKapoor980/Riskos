import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from statsmodels.tsa.arima.model import ARIMA
from arch import arch_model
from scipy import stats
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

def get_csv_file_mapping(folder_path):
    """Create a mapping of stock symbols to their CSV file paths."""
    file_mapping = {}
    if not os.path.exists(folder_path):
        raise FileNotFoundError(f"The folder '{folder_path}' does not exist.")

    for file_name in os.listdir(folder_path):
        if file_name.endswith('.csv'):
            stock_symbol = file_name.split('_')[0]
            file_mapping[stock_symbol] = os.path.join(folder_path, file_name)
    return file_mapping

def calculate_var(returns, portfolio_value, confidence_level=0.95):
    """Calculate Value at Risk (VaR)."""
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    return round(var_threshold * portfolio_value, 2)

def calculate_cvar(returns, portfolio_value, confidence_level=0.95):
    """Calculate Conditional Value at Risk (CVaR)."""
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    cvar = returns[returns <= var_threshold].mean()
    return round(cvar * portfolio_value, 2)

def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    """Calculate Sharpe Ratio."""
    excess_returns = returns.mean() - (risk_free_rate / 252)
    return round(excess_returns / returns.std(), 2)

def calculate_max_drawdown(returns):
    """Calculate Maximum Drawdown."""
    cum_returns = (1 + returns / 100).cumprod()
    running_max = cum_returns.cummax()
    drawdown = (cum_returns - running_max) / running_max
    return round(drawdown.min() * 100, 4)

def predict_portfolio_risk(stock_file_mapping, portfolio_stocks, forecast_days=30, confidence_level=0.95):
    """Main prediction function."""
    stock_results = {}
    all_returns_data = {}
    stock_weights = {}
    portfolio_value = 0
    total_profit_loss = 0
    
    # Create output directory
    output_dir = "portfolio_analysis_outputs"
    os.makedirs(output_dir, exist_ok=True)

    # Load data and calculate metrics
    for symbol, details in portfolio_stocks.items():
        quantity = details['quantity']
        buy_price = details['buy_price']
        
        if symbol not in stock_file_mapping:
            print(f"No data file found for {symbol}. Skipping...")
            continue

        try:
            stock_df = pd.read_csv(stock_file_mapping[symbol], parse_dates=['Date'], index_col='Date')
            stock_df['Close'] = pd.to_numeric(stock_df['Close'], errors='coerce')
            stock_df.dropna(subset=['Close'], inplace=True)

            if stock_df.empty:
                print(f"No data found for {symbol}. Skipping...")
                continue

            current_price = stock_df['Close'].iloc[-1]
            position_value = current_price * quantity
            portfolio_value += position_value
            profit_loss = (current_price - buy_price) * quantity
            total_profit_loss += profit_loss

            stock_df['Returns'] = stock_df['Close'].pct_change() * 100
            returns = stock_df['Returns'].dropna()
            all_returns_data[symbol] = returns
            stock_weights[symbol] = position_value

        except Exception as e:
            print(f"Error processing {symbol}: {str(e)}")
            continue

    # Calculate weights
    for symbol in stock_weights:
        stock_weights[symbol] = stock_weights[symbol] / portfolio_value

    # Calculate metrics and forecasts
    for symbol, details in portfolio_stocks.items():
        if symbol not in all_returns_data:
            continue

        quantity = details['quantity']
        buy_price = details['buy_price']
        returns = all_returns_data[symbol]
        position_value = stock_weights[symbol] * portfolio_value

        try:
            # Forecast returns with ARIMA
            arima_model = ARIMA(returns, order=(1, 0, 1))
            arima_fit = arima_model.fit()
            forecast_returns = arima_fit.forecast(steps=forecast_days)

            # Forecast volatility with GARCH
            garch_model = arch_model(returns, vol='Garch', p=1, q=1)
            garch_fit = garch_model.fit(disp='off')
            forecast_result = garch_fit.forecast(horizon=forecast_days, reindex=False)
            forecast_vol = np.sqrt(forecast_result.variance.values[-1, :])

            # Calculate risk metrics
            z_score = stats.norm.ppf(1 - confidence_level)
            var_pct = forecast_returns.mean() + (z_score * forecast_vol.mean())
            var_amount = position_value * (var_pct / 100)
            
            cvar_z = stats.norm.pdf(z_score) / (1 - confidence_level)
            cvar_pct = forecast_returns.mean() + (forecast_vol.mean() * cvar_z)
            cvar_amount = position_value * (cvar_pct / 100)
            
            sharpe_ratio = (forecast_returns.mean() - (0.05 / 252)) / forecast_vol.mean()

            stock_results[symbol] = {
                'quantity': quantity,
                'current_price': current_price,
                'buy_price': buy_price,
                'position_value': position_value,
                'weight': stock_weights[symbol],
                'profit_loss': profit_loss,
                'roi': (profit_loss / (buy_price * quantity)) * 100,
                'var_amount': var_amount,
                'cvar_amount': cvar_amount,
                'sharpe_ratio': sharpe_ratio,
                'max_drawdown': calculate_max_drawdown(returns),
                'forecast_return': forecast_returns.mean(),
                'forecast_volatility': forecast_vol.mean()
            }

        except Exception as e:
            print(f"Error processing forecasts for {symbol}: {str(e)}")
            continue

    if stock_results:
        # Portfolio metrics
        portfolio_returns = pd.Series(0, index=returns.index)
        for symbol, weight in stock_weights.items():
            if symbol in all_returns_data:
                portfolio_returns += all_returns_data[symbol] * weight

        portfolio_var = calculate_var(portfolio_returns, portfolio_value, confidence_level)
        portfolio_cvar = calculate_cvar(portfolio_returns, portfolio_value, confidence_level)
        portfolio_sharpe = calculate_sharpe_ratio(portfolio_returns)
        portfolio_max_drawdown = calculate_max_drawdown(portfolio_returns)

        output = {
            "portfolio_summary": {
                "Total Portfolio Value": f"₹{portfolio_value:,.2f}",
                "Total Profit/Loss": f"₹{total_profit_loss:,.2f}",
                "Portfolio Return": f"{(total_profit_loss / portfolio_value) * 100:.2f}%",
                "Value at Risk (VaR)": f"₹{abs(portfolio_var):,.2f}",
                "Conditional VaR (CVaR)": f"₹{abs(portfolio_cvar):,.2f}",
                "Sharpe Ratio": round(portfolio_sharpe, 2),
                "Maximum Drawdown": f"{abs(portfolio_max_drawdown):.2f}%",
                "Risk Level": "High" if portfolio_sharpe < 0.5 else "Moderate" if portfolio_sharpe < 1 else "Low",
                "Recommendation": "Hold" if portfolio_sharpe > 1 else "Consider rebalancing"
            },
            "individual_stocks": stock_results
        }
        print(json.dumps(output, indent=4))

# Example Usage
# Replace with your actual folder path and portfolio details
folder_path = "F:\Capstone 1\Riskos\backend\flask-api\Scripts"
portfolio_stocks = {
    "AAPL": {"quantity": 10, "buy_price": 150},
    "GOOGL": {"quantity": 5, "buy_price": 2800},
    "MSFT": {"quantity": 8, "buy_price": 300}
}
stock_file_mapping = get_csv_file_mapping(folder_path)
predict_portfolio_risk(stock_file_mapping, portfolio_stocks)
