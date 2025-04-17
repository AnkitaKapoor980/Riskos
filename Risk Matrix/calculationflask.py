import os
import pandas as pd
import numpy as np
import json
from flask import Flask, request, jsonify

app = Flask(__name__)

def load_stock_data(folder_path):
    stock_data = {}
    for file in os.listdir(folder_path):
        if file.endswith("_data.csv"):
            file_path = os.path.join(folder_path, file)
            df = pd.read_csv(file_path)
            df["Close"] = pd.to_numeric(df["Close"], errors="coerce")
            df.dropna(inplace=True)
            df["Date"] = pd.to_datetime(df["Date"])
            df.set_index("Date", inplace=True)
            stock_name = file.replace("_data.csv", "")
            stock_data[stock_name] = df["Close"]
    return pd.DataFrame(stock_data)

def calculate_var(returns, portfolio_value, confidence_level=0.95):
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    return round(var_threshold * portfolio_value, 2)

def calculate_cvar(returns, portfolio_value, confidence_level=0.95):
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    cvar = returns[returns <= var_threshold].mean()
    return round(cvar * portfolio_value, 2)

def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    excess_returns = returns.mean() - risk_free_rate / 252
    return round(excess_returns / returns.std(), 2)

def calculate_max_drawdown(prices):
    cumulative_max = prices.cummax()
    drawdown = (prices - cumulative_max) / cumulative_max
    return round(drawdown.min(), 4)

folder_path = "Scripts.csv"  
stock_prices = load_stock_data(folder_path)
returns = stock_prices.pct_change().dropna()

@app.route('/calculate-risk', methods=['POST'])
def calculate_risk():
    try:
        data = request.get_json()  
        portfolio = data.get("portfolio", {})

        portfolio_value = sum(stock["quantity"] * stock["buy_price"] for stock in portfolio.values())

        risk_metrics = {}
        stock_values = {stock: portfolio[stock]["quantity"] * stock_prices[stock].iloc[-1] for stock in portfolio}
        
        for stock in portfolio:
            stock_returns = returns[stock]
            stock_value = stock_values[stock]

            risk_metrics[stock] = {
                "VaR (₹)": calculate_var(stock_returns, stock_value),
                "CVaR (₹)": calculate_cvar(stock_returns, stock_value),
                "Sharpe Ratio": calculate_sharpe_ratio(stock_returns),
                "Max Drawdown": calculate_max_drawdown(stock_prices[stock])
            }

        weights = np.array([stock_values[stock] / portfolio_value for stock in portfolio])
        portfolio_returns = returns[list(portfolio.keys())].dot(weights)

        portfolio_risk_metrics = {
            "Total Portfolio Value (₹)": round(portfolio_value, 2),
            "VaR (₹)": calculate_var(portfolio_returns, portfolio_value),
            "CVaR (₹)": calculate_cvar(portfolio_returns, portfolio_value),
            "Sharpe Ratio": calculate_sharpe_ratio(portfolio_returns),
            "Max Drawdown": calculate_max_drawdown(stock_prices.mean(axis=1))
        }

        response_data = {
            "individual_stocks": risk_metrics,
            "portfolio_summary": portfolio_risk_metrics
        }

        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True)
