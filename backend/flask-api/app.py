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

folder_path = "backend\\flask-api\\Scripts"
stock_prices = load_stock_data(folder_path)
returns = stock_prices.pct_change().dropna()

@app.route('/calculate-risk', methods=['POST'])
def calculate_risk():
    try:
        data = request.get_json()
        portfolio = data.get("portfolio", {})

        portfolio_value = sum(stock["quantity"] * stock["buy_price"] for stock in portfolio.values())
        stock_values = {stock: portfolio[stock]["quantity"] * stock_prices[stock].iloc[-1] for stock in portfolio}

        risk_metrics = {}
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
