import os
from flask_cors import CORS
from flask import Flask, request, jsonify
from utils.data_loader import load_stock_data
from models.risk_metrics import (
    calculate_var,
    calculate_cvar,
    calculate_sharpe_ratio,
    calculate_max_drawdown
)
import numpy as np

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
folder_path = os.path.join(BASE_DIR, 'Scripts')
stock_prices = load_stock_data(folder_path)
returns = stock_prices.pct_change().dropna()

@app.route('/calculate-risk', methods=['POST'])
def calculate_risk():
    try:
        data = request.get_json()
        portfolio = data.get("portfolio", [])

        if not portfolio:
            return jsonify({"error": "No portfolio provided"}), 400

        portfolio_value = sum(stock["quantity"] * stock_prices[stock["symbol"]].iloc[-1] for stock in portfolio)
        
        stock_weights = {}
        stock_returns_data = {}

        for stock in portfolio:
            symbol = stock["symbol"]
            quantity = stock["quantity"]
            if symbol not in stock_prices.columns:
                continue
            current_price = stock_prices[symbol].iloc[-1]
            stock_value = quantity * current_price
            stock_weights[symbol] = stock_value
            stock_returns_data[symbol] = returns[symbol]

        total_value = sum(stock_weights.values())
        for symbol in stock_weights:
            stock_weights[symbol] /= total_value

        risk_metrics = {}
        for symbol, weight in stock_weights.items():
            ret = stock_returns_data[symbol]
            val = total_value * weight
            risk_metrics[symbol] = {
                "VaR (₹)": calculate_var(ret, val),
                "CVaR (₹)": calculate_cvar(ret, val),
                "Sharpe Ratio": calculate_sharpe_ratio(ret),
                "Max Drawdown (%)": calculate_max_drawdown(stock_prices[symbol])
            }

        portfolio_returns = sum(stock_returns_data[symbol] * weight for symbol, weight in stock_weights.items())
        portfolio_var = calculate_var(portfolio_returns, total_value)
        portfolio_cvar = calculate_cvar(portfolio_returns, total_value)
        portfolio_sharpe = calculate_sharpe_ratio(portfolio_returns)
        portfolio_drawdown = calculate_max_drawdown(portfolio_returns.cumsum())

        return jsonify({
            "portfolio_summary": {
                "Total Value": f"₹{total_value:,.2f}",
                "VaR (₹)": abs(portfolio_var),
                "CVaR (₹)": abs(portfolio_cvar),
                "Sharpe Ratio": portfolio_sharpe,
                "Max Drawdown (%)": abs(portfolio_drawdown)
            },
            "individual_stocks": risk_metrics
        })

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
