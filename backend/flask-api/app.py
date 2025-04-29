import os
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.data_loader import load_stock_data, get_csv_file_mapping
from models.risk_metrics import (
    calculate_var,
    calculate_cvar,
    calculate_sharpe_ratio,
    calculate_max_drawdown
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5001", 
                                 "allow_headers": ["Content-Type", "Authorization"]}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
folder_path = os.path.join(BASE_DIR, 'Scripts')

# Load stock data and mapping
stock_prices = load_stock_data(folder_path)
stock_mapping = get_csv_file_mapping(folder_path)
returns = stock_prices.pct_change().dropna()

@app.route('/calculate-risk', methods=['POST'])
def calculate_risk():
    try:
        data = request.get_json()
        print("Received request with data:", data)

        portfolio = data.get("portfolio", [])
        confidence_level = data.get("confidenceLevel", 95)

        # Calculate total portfolio value
        portfolio_value = sum(int(stock["quantity"]) * int(stock["buyPrice"]) for stock in portfolio)

        # Calculate individual stock values
        stock_values = {
            stock["stockName"]: int(stock["quantity"]) * stock_prices[stock_mapping[stock["stockName"]]["full_name"]].iloc[-1]
            for stock in portfolio
        }

        # Individual stock risk metrics
        risk_metrics = {}
        for stock in portfolio:
            stock_symbol = stock["stockName"]
            full_name = stock_mapping[stock_symbol]["full_name"]
            stock_returns = returns[full_name]
            stock_value = stock_values[stock_symbol]

            risk_metrics[stock_symbol] = {
                "VaR (₹)": calculate_var(stock_returns, stock_value, confidence_level),
                "CVaR (₹)": calculate_cvar(stock_returns, stock_value, confidence_level),
                "Sharpe Ratio": calculate_sharpe_ratio(stock_returns),
                "Max Drawdown": calculate_max_drawdown(stock_prices[full_name])
            }

        # Portfolio-level metrics
        weights = np.array([
            stock_values[stock["stockName"]] / portfolio_value for stock in portfolio
        ])
        selected_columns = [stock_mapping[stock["stockName"]]["full_name"] for stock in portfolio]
        selected_returns = returns[selected_columns]
        portfolio_returns = selected_returns.dot(weights)

        portfolio_risk_metrics = {
            "Total Portfolio Value (₹)": round(portfolio_value, 2),
            "VaR (₹)": calculate_var(portfolio_returns, portfolio_value, confidence_level),
            "CVaR (₹)": calculate_cvar(portfolio_returns, portfolio_value, confidence_level),
            "Sharpe Ratio": calculate_sharpe_ratio(portfolio_returns),
            "Max Drawdown": calculate_max_drawdown(stock_prices.mean(axis=1))
        }

        return jsonify({
            "individual_stocks": risk_metrics,
            "portfolio_summary": portfolio_risk_metrics
        })

    except Exception as e:
        print("Error in calculating risk:", e)
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    app.run(debug=True, port=5002)
