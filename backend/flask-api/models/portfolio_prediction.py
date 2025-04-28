import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
from statsmodels.tsa.arima.model import ARIMA
from arch import arch_model
from scipy import stats
import warnings

warnings.filterwarnings('ignore')

def get_csv_file_mapping(folder_path):
    """Create a mapping of stock symbols to their CSV file paths."""
    file_mapping = {}
    if not os.path.exists(folder_path):
        raise FileNotFoundError(f"The folder '{folder_path}' does not exist.")

    for file_name in os.listdir(folder_path):
        if file_name.endswith('.csv'):
            stock_symbol = file_name.split('_')[0]
            file_mapping[stock_symbol.upper()] = os.path.join(folder_path, file_name)
    return file_mapping

def calculate_var(returns, portfolio_value, confidence_level=0.95):
    if len(returns) == 0:
        return 0
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    return round(var_threshold * portfolio_value, 2)

def calculate_cvar(returns, portfolio_value, confidence_level=0.95):
    if len(returns) == 0:
        return 0
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    cvar = returns[returns <= var_threshold].mean()
    return round(cvar * portfolio_value, 2)

def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    if len(returns) == 0 or returns.std() == 0:
        return 0
    daily_risk_free_rate = risk_free_rate / 252
    excess_daily_return = returns.mean() - daily_risk_free_rate
    return round(excess_daily_return / returns.std(), 2)

def calculate_max_drawdown(prices):
    if len(prices) == 0:
        return 0
    cumulative_max = prices.cummax()
    drawdown = (prices - cumulative_max) / cumulative_max
    return round(drawdown.min() * 100, 2)

def predict_portfolio_risk(stock_file_mapping, portfolio_stocks, forecast_days=30, confidence_level=0.95):
    stock_results = {}
    all_returns_data = {}
    stock_weights = {}
    portfolio_value = 0
    total_investment = 0

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
                print(f"No data for {symbol}. Skipping...")
                continue

            current_price = stock_df['Close'].iloc[-1]
            position_value = current_price * quantity
            investment_value = buy_price * quantity

            portfolio_value += position_value
            total_investment += investment_value

            returns = stock_df['Close'].pct_change().dropna()
            all_returns_data[symbol] = returns
            stock_weights[symbol] = position_value

        except Exception as e:
            print(f"Error processing {symbol}: {str(e)}")
            continue

    if portfolio_value == 0:
        print("Portfolio value is zero. Exiting...")
        return

    # Normalize weights
    for symbol in stock_weights:
        stock_weights[symbol] /= portfolio_value

    # Forecast and risk metrics
    for symbol in all_returns_data.keys():
        returns = all_returns_data[symbol]
        position_value = stock_weights[symbol] * portfolio_value

        try:
            arima_model = ARIMA(returns, order=(1, 0, 1))
            arima_fit = arima_model.fit()
            forecast_returns = arima_fit.forecast(steps=forecast_days)

            garch_model = arch_model(returns, vol='Garch', p=1, q=1)
            garch_fit = garch_model.fit(disp='off')
            forecast_vol = np.sqrt(garch_fit.forecast(horizon=forecast_days).variance.values[-1, :])

            z_score = stats.norm.ppf(1 - confidence_level)
            var_pct = forecast_returns.mean() + z_score * forecast_vol.mean()
            var_amount = position_value * var_pct

            cvar_z = stats.norm.pdf(z_score) / (1 - confidence_level)
            cvar_pct = forecast_returns.mean() + cvar_z * forecast_vol.mean()
            cvar_amount = position_value * cvar_pct

            stock_results[symbol] = {
                'forecast_return': round(forecast_returns.mean() * 100, 2),
                'forecast_volatility': round(forecast_vol.mean() * 100, 2),
                'VaR (₹)': round(var_amount, 2),
                'CVaR (₹)': round(cvar_amount, 2),
                'Sharpe Ratio': calculate_sharpe_ratio(forecast_returns),
            }
        except Exception as e:
            print(f"Forecast error for {symbol}: {str(e)}")
            continue

    portfolio_returns = sum(all_returns_data[symbol] * weight for symbol, weight in stock_weights.items())
    portfolio_var = calculate_var(portfolio_returns, portfolio_value, confidence_level)
    portfolio_cvar = calculate_cvar(portfolio_returns, portfolio_value, confidence_level)
    portfolio_sharpe = calculate_sharpe_ratio(portfolio_returns)
    portfolio_drawdown = calculate_max_drawdown(portfolio_returns.cumsum())

    output = {
        "portfolio_summary": {
            "Total Investment": f"₹{total_investment:,.2f}",
            "Current Value": f"₹{portfolio_value:,.2f}",
            "Total Return (%)": round(((portfolio_value - total_investment) / total_investment) * 100, 2),
            "VaR (₹)": abs(portfolio_var),
            "CVaR (₹)": abs(portfolio_cvar),
            "Sharpe Ratio": portfolio_sharpe,
            "Max Drawdown (%)": abs(portfolio_drawdown)
        },
        "individual_stocks": stock_results
    }

    print(json.dumps(output, indent=4))
