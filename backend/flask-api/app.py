import os
import json
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from statsmodels.tsa.arima.model import ARIMA
from arch import arch_model
from scipy import stats
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

# Folder containing stock CSVs
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
folder_path = os.path.join(BASE_DIR, 'Scripts')  # Your CSV files are here

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
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    return round(var_threshold * portfolio_value, 2)

def calculate_cvar(returns, portfolio_value, confidence_level=0.95):
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    cvar = returns[returns <= var_threshold].mean()
    return round(cvar * portfolio_value, 2)

def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    excess_returns = returns.mean() - (risk_free_rate / 252)
    return round(excess_returns / returns.std(), 2)

def calculate_max_drawdown(returns):
    cum_returns = (1 + returns / 100).cumprod()
    running_max = cum_returns.cummax()
    drawdown = (cum_returns - running_max) / running_max
    return round(drawdown.min() * 100, 4)

def predict_portfolio_risk(stock_file_mapping, portfolio_stocks, forecast_days=30, confidence_level=0.95):
    stock_results = {}
    all_returns_data = {}
    stock_weights = {}
    portfolio_value = 0
    total_profit_loss = 0

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

    for symbol in stock_weights:
        stock_weights[symbol] = stock_weights[symbol] / portfolio_value

    for symbol, details in portfolio_stocks.items():
        if symbol not in all_returns_data:
            continue

        quantity = details['quantity']
        buy_price = details['buy_price']
        returns = all_returns_data[symbol]
        position_value = stock_weights[symbol] * portfolio_value

        try:
            arima_model = ARIMA(returns, order=(1, 0, 1))
            arima_fit = arima_model.fit()
            forecast_returns = arima_fit.forecast(steps=forecast_days)

            garch_model = arch_model(returns, vol='Garch', p=1, q=1)
            garch_fit = garch_model.fit(disp='off')
            forecast_result = garch_fit.forecast(horizon=forecast_days, reindex=False)
            forecast_vol = np.sqrt(forecast_result.variance.values[-1, :])

            z_score = stats.norm.ppf(1 - confidence_level)
            var_pct = forecast_returns.mean() + (z_score * forecast_vol.mean())
            var_amount = position_value * (var_pct / 100)

            cvar_z = stats.norm.pdf(z_score) / (1 - confidence_level)
            cvar_pct = forecast_returns.mean() + (forecast_vol.mean() * cvar_z)
            cvar_amount = position_value * (cvar_pct / 100)

            sharpe_ratio = (forecast_returns.mean() - (0.05 / 252)) / forecast_vol.mean()

            stock_results[symbol] = {
                'quantity': quantity,
                'current_price': round(current_price, 2),
                'buy_price': buy_price,
                'position_value': round(position_value, 2),
                'weight': round(stock_weights[symbol], 4),
                'profit_loss': round(profit_loss, 2),
                'roi': round((profit_loss / (buy_price * quantity)) * 100, 2),
                'var_amount': round(var_amount, 2),
                'cvar_amount': round(cvar_amount, 2),
                'sharpe_ratio': round(sharpe_ratio, 2),
                'max_drawdown': calculate_max_drawdown(returns),
                'forecast_return': round(forecast_returns.mean(), 4),
                'forecast_volatility': round(forecast_vol.mean(), 4)
            }

        except Exception as e:
            print(f"Error processing forecasts for {symbol}: {str(e)}")
            continue

    output = {}
    if stock_results:
        portfolio_returns = pd.Series(0, index=list(all_returns_data.values())[0].index)
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
    
    return output

@app.route('/calculate-risk', methods=['POST'])
def calculate_risk():
    try:
        data = request.get_json()
        print("Received data:", data)

        portfolio_list = data.get("portfolio", [])
        portfolio_stocks = {
            stock["symbol"]: {"quantity": stock["quantity"], "buy_price": stock["buy_price"]}
            for stock in portfolio_list
        }

        stock_file_mapping = get_csv_file_mapping(folder_path)
        result = predict_portfolio_risk(stock_file_mapping, portfolio_stocks)

        return jsonify(result)

    except Exception as e:
        print("Error in calculate-risk:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002)
