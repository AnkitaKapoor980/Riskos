import numpy as np

def calculate_var(returns, portfolio_value, confidence_level=0.95):
    """Calculate Value at Risk (VaR) in ₹."""
    if len(returns) == 0:
        return 0
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    return round(var_threshold * portfolio_value, 2)

def calculate_cvar(returns, portfolio_value, confidence_level=0.95):
    """Calculate Conditional Value at Risk (CVaR) in ₹."""
    if len(returns) == 0:
        return 0
    var_threshold = np.percentile(returns, (1 - confidence_level) * 100)
    cvar = returns[returns <= var_threshold].mean()
    return round(cvar * portfolio_value, 2)

def calculate_sharpe_ratio(returns, risk_free_rate=0.05):
    """Calculate Sharpe Ratio (daily returns assumed)."""
    if len(returns) == 0 or returns.std() == 0:
        return 0
    daily_risk_free_rate = risk_free_rate / 252
    excess_daily_return = returns.mean() - daily_risk_free_rate
    sharpe_ratio = excess_daily_return / returns.std()
    return round(sharpe_ratio, 2)

def calculate_max_drawdown(prices):
    """Calculate Maximum Drawdown from price series."""
    if len(prices) == 0:
        return 0
    cumulative_max = prices.cummax()
    drawdown = (prices - cumulative_max) / cumulative_max
    max_drawdown = drawdown.min()
    return round(max_drawdown * 100, 2)  # In percentage
