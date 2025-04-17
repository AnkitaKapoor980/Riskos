import os
import pandas as pd
import numpy as np
import scipy.stats as stats
import matplotlib.pyplot as plt

# Function to clean and load stock data
def load_stock_data(folder_path):
    stock_data = {}
    
    for file in os.listdir(folder_path):
        if file.endswith("_data.csv"):  # Ensure we only read relevant files
            file_path = os.path.join(folder_path, file)
            df = pd.read_csv(file_path)
            df["Close"] = pd.to_numeric(df["Close"], errors="coerce")  # Convert to numeric, force errors to NaN
            df.dropna(inplace=True)  # Remove rows with NaN values
            df.dropna(inplace=True)  # Remove NaN rows
            df["Date"] = pd.to_datetime(df["Date"])
            df.set_index("Date", inplace=True)
            stock_name = file.replace("_data.csv", "")  # Extract stock name
            stock_data[stock_name] = df["Close"]
    
    return pd.DataFrame(stock_data)

# Function to calculate Value at Risk (VaR) using historical simulation
def calculate_var(returns, confidence_level=0.95):
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    return var_threshold

# Function to calculate Conditional VaR (CVaR)
def calculate_cvar(returns, confidence_level=0.95):
    var_threshold = calculate_var(returns, confidence_level)
    cvar = returns[returns <= var_threshold].mean()
    return cvar

# Function to calculate Sharpe Ratio
def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    excess_returns = returns.mean() - risk_free_rate / 252  # Assuming daily returns
    return excess_returns / returns.std()

# Function to calculate Maximum Drawdown
def calculate_max_drawdown(prices):
    cumulative_max = prices.cummax()
    drawdown = (prices - cumulative_max) / cumulative_max
    return drawdown.min()

# Function to perform Monte Carlo simulation
def monte_carlo_simulation(returns, num_simulations=1000, time_horizon=252):
    mean_return = returns.mean()
    std_dev = returns.std()
    simulated_paths = []
    
    for _ in range(num_simulations):
        simulated_returns = np.random.normal(mean_return, std_dev, time_horizon)
        simulated_price = (1 + simulated_returns).cumprod()
        simulated_paths.append(simulated_price)
    
    return simulated_paths

# Load data
folder_path = "Scripts.csv"  # Update with your actual folder path
stock_prices = load_stock_data(folder_path)
returns = stock_prices.pct_change().dropna()

# Calculate risk metrics for each stock
risk_metrics = {}
for stock in returns.columns:
    stock_returns = returns[stock]
    risk_metrics[stock] = {
        "VaR": calculate_var(stock_returns),
        "CVaR": calculate_cvar(stock_returns),
        "Sharpe Ratio": calculate_sharpe_ratio(stock_returns),
        "Max Drawdown": calculate_max_drawdown(stock_prices[stock])
    }

# Portfolio-level calculations
weights = np.ones(len(returns.columns)) / len(returns.columns)  # Equal weights for simplicity
portfolio_returns = returns.dot(weights)
portfolio_risk_metrics = {
    "VaR": calculate_var(portfolio_returns),
    "CVaR": calculate_cvar(portfolio_returns),
    "Sharpe Ratio": calculate_sharpe_ratio(portfolio_returns),
    "Max Drawdown": calculate_max_drawdown(stock_prices.mean(axis=1))
}

# Print results
print("Individual Stock Risk Metrics:")
for stock, metrics in risk_metrics.items():
    print(f"{stock}: {metrics}")

print("\nPortfolio Risk Metrics:")
print(portfolio_risk_metrics)
