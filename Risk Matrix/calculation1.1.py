import os
import pandas as pd
import numpy as np
import json

# Function to clean and load stock data
def load_stock_data(folder_path):
    stock_data = {}

    for file in os.listdir(folder_path):
        if file.endswith("_data.csv"):  # Ensure we only read relevant files
            file_path = os.path.join(folder_path, file)
            df = pd.read_csv(file_path)
            df["Close"] = pd.to_numeric(df["Close"], errors="coerce")  # Convert to numeric
            df.dropna(inplace=True)  # Remove NaN values
            df["Date"] = pd.to_datetime(df["Date"])
            df.set_index("Date", inplace=True)
            stock_name = file.replace("_data.csv", "")  # Extract stock name
            stock_data[stock_name] = df["Close"]

    return pd.DataFrame(stock_data)

# Function to calculate Value at Risk (VaR)
def calculate_var(returns, portfolio_value, confidence_level=0.95):
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    return round(var_threshold * portfolio_value, 2)  # Rounded for better readability

# Function to calculate Conditional VaR (CVaR)
def calculate_cvar(returns, portfolio_value, confidence_level=0.95):
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    cvar = returns[returns <= var_threshold].mean()
    return round(cvar * portfolio_value, 2)

# Function to calculate Sharpe Ratio
def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    excess_returns = returns.mean() - risk_free_rate / 252  # Assuming daily returns
    return round(excess_returns / returns.std(), 2)

# Function to calculate Maximum Drawdown
def calculate_max_drawdown(prices):
    cumulative_max = prices.cummax()
    drawdown = (prices - cumulative_max) / cumulative_max
    return round(drawdown.min(), 4)

# Load stock prices
folder_path = "Scripts.csv"  # Update with your actual folder path
stock_prices = load_stock_data(folder_path)
returns = stock_prices.pct_change().dropna()

# User-defined portfolio details
portfolio = {
    # "ADANIPORTS.NS": {"quantity": 75, "buy_price": 1240},
    "RELIANCE.NS": {"quantity": 150, "buy_price": 1200},
    # Add more stocks here
}

# Calculate total portfolio value based on buy price (initial investment)
portfolio_value = sum(data["quantity"] * data["buy_price"] for data in portfolio.values())

# Calculate current portfolio value based on latest market price
current_portfolio_value = sum(data["quantity"] * stock_prices[stock].iloc[-1] for stock, data in portfolio.items())

# Store current value per stock
stock_values = {stock: portfolio[stock]["quantity"] * stock_prices[stock].iloc[-1] for stock in portfolio}

# Calculate individual stock risk metrics
risk_metrics = {}

for stock in portfolio:
    stock_returns = returns[stock]
    stock_value = stock_values[stock]

    risk_metrics[stock] = {
        "Initial Investment (₹)": portfolio[stock]["quantity"] * portfolio[stock]["buy_price"],
        "Current Value (₹)": stock_value,  # Add current value
        "VaR (₹)": calculate_var(stock_returns, stock_value),
        "CVaR (₹)": calculate_cvar(stock_returns, stock_value),
        "Sharpe Ratio": calculate_sharpe_ratio(stock_returns),
        "Max Drawdown": calculate_max_drawdown(stock_prices[stock])
    }

# Portfolio-level calculations
weights = np.array([stock_values[stock] / current_portfolio_value for stock in portfolio])  # Weight based on current value
portfolio_returns = returns[list(portfolio.keys())].dot(weights)  # Weighted portfolio returns

portfolio_risk_metrics = {
    "Initial Portfolio Value (₹)": round(portfolio_value, 2),
    "Current Portfolio Value (₹)": round(current_portfolio_value, 2),  # Add current value
    "VaR (₹)": calculate_var(portfolio_returns, current_portfolio_value),
    "CVaR (₹)": calculate_cvar(portfolio_returns, current_portfolio_value),
    "Sharpe Ratio": calculate_sharpe_ratio(portfolio_returns),
    "Max Drawdown": calculate_max_drawdown(stock_prices.mean(axis=1))
}

# Combine results into a single JSON output
output_json = {
    "individual_stocks": risk_metrics,
    "portfolio_summary": portfolio_risk_metrics
}

# Convert to JSON and return
json_result = json.dumps(output_json, indent=4)
print(json_result)  # In actual backend, return this as an API response
