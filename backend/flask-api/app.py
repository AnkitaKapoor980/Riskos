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
# Enable CORS for the entire app
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
folder_path = os.path.join(BASE_DIR, 'Scripts')
stock_prices = load_stock_data(folder_path)
returns = stock_prices.pct_change().dropna()

@app.route('/calculate-risk', methods=['POST'])
def calculate_risk():
    try:
        # Log the incoming request data for debugging
        print("Received request with data:", request.get_json())

        # Get the data from the request body
        data = request.get_json()
        portfolio = data.get("portfolio", [])

        # Calculate the total portfolio value
        portfolio_value = sum(stock["quantity"] * stock["buy_price"] for stock in portfolio)
        
        # Calculate the stock values (quantity * current price)
        stock_values = {
            stock["symbol"]: stock["quantity"] * stock_prices[stock["symbol"]].iloc[-1]
            for stock in portfolio
        }

        # Calculate individual stock risk metrics
        risk_metrics = {}
        for stock in portfolio:
            stock_symbol = stock["symbol"]
            stock_returns = returns[stock_symbol]
            stock_value = stock_values[stock_symbol]

            risk_metrics[stock_symbol] = {
                "VaR (₹)": calculate_var(stock_returns, stock_value),
                "CVaR (₹)": calculate_cvar(stock_returns, stock_value),
                "Sharpe Ratio": calculate_sharpe_ratio(stock_returns),
                "Max Drawdown": calculate_max_drawdown(stock_prices[stock_symbol])
            }

        # Calculate portfolio risk metrics
        weights = np.array([
            stock_values[stock["symbol"]] / portfolio_value for stock in portfolio
        ])
        selected_returns = returns[[stock["symbol"] for stock in portfolio]]
        portfolio_returns = selected_returns.dot(weights)

        portfolio_risk_metrics = {
            "Total Portfolio Value (₹)": round(portfolio_value, 2),
            "VaR (₹)": calculate_var(portfolio_returns, portfolio_value),
            "CVaR (₹)": calculate_cvar(portfolio_returns, portfolio_value),
            "Sharpe Ratio": calculate_sharpe_ratio(portfolio_returns),
            "Max Drawdown": calculate_max_drawdown(stock_prices.mean(axis=1))
        }

        # Prepare the response data to send back
        response_data = {
            "individual_stocks": risk_metrics,
            "portfolio_summary": portfolio_risk_metrics
        }

        # Send the response back as JSON
        return jsonify(response_data)

    except Exception as e:
        # Log the error in case something goes wrong
        print("Error in calculating risk:", e)  # Log any error that occurs
        return jsonify({"error": str(e)})

if __name__ == '__main__':
    # Run the app on port 5002, since backend is on port 5000
    app.run(debug=True, port=5002)
