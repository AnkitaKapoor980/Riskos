import os
import pandas as pd
import yfinance as yf
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load API keys from environment variables
load_dotenv()
TIINGO_API_KEY = os.getenv("TIINGO_API_KEY")
ALPHA_VANTAGE_API_KEY = os.getenv("ALPHA_VANTAGE_API_KEY")

def fetch_from_yahoo(stock_symbol, start_date, end_date):
    """Fetch historical stock data from Yahoo Finance."""
    try:
        stock = yf.download(stock_symbol, start=start_date, end=end_date)
        if stock.empty:
            raise ValueError("No data found on Yahoo Finance.")
        stock["Stock"] = stock_symbol
        return stock[["Stock", "Close"]].reset_index()
    except Exception as e:
        print(f"Yahoo Finance failed: {e}")
        return None

def fetch_from_tiingo(stock_symbol, start_date, end_date):
    """Fetch historical stock data from Tiingo."""
    try:
        url = f"https://api.tiingo.com/tiingo/daily/{stock_symbol}/prices"
        params = {
            "startDate": start_date,
            "endDate": end_date,
            "token": TIINGO_API_KEY,
        }
        response = requests.get(url, params=params)
        data = response.json()
        if not data or isinstance(data, dict):
            raise ValueError("No data found on Tiingo.")
        df = pd.DataFrame(data)
        df["Stock"] = stock_symbol
        return df[["date", "Stock", "close"]].rename(columns={"date": "Date", "close": "Close"})
    except Exception as e:
        print(f"Tiingo failed: {e}")
        return None

def fetch_from_alpha_vantage(stock_symbol):
    """Fetch historical stock data from Alpha Vantage."""
    try:
        url = "https://www.alphavantage.co/query"
        params = {
            "function": "TIME_SERIES_DAILY_ADJUSTED",
            "symbol": stock_symbol,
            "outputsize": "full",
            "apikey": ALPHA_VANTAGE_API_KEY,
        }
        response = requests.get(url, params=params)
        data = response.json()
        if "Time Series (Daily)" not in data:
            raise ValueError("No data found on Alpha Vantage.")
        
        df = pd.DataFrame.from_dict(data["Time Series (Daily)"], orient="index")
        df.index = pd.to_datetime(df.index)
        df = df.rename(columns={"4. close": "Close"})
        df["Stock"] = stock_symbol
        return df[["Stock", "Close"]].reset_index().rename(columns={"index": "Date"})
    except Exception as e:
        print(f"Alpha Vantage failed: {e}")
        return None

def get_stock_data(stock_symbol, start_date, end_date, save_csv=True):
    """Fetch historical stock data using multiple APIs in sequence."""
    stock_data = fetch_from_yahoo(stock_symbol, start_date, end_date)

    if stock_data is None:
        stock_data = fetch_from_tiingo(stock_symbol, start_date, end_date)

    if stock_data is None:
        stock_data = fetch_from_alpha_vantage(stock_symbol)

    if stock_data is None:
        print("All APIs failed to fetch data.")
        return None

    stock_data["Date"] = pd.to_datetime(stock_data["Date"])
    stock_data = stock_data.sort_values("Date")

    if save_csv:
        file_name = f"{stock_symbol}_data.csv"
        stock_data.to_csv(file_name, index=False)
        print(f"Data saved to {file_name}")

    return stock_data

# Example usage
if __name__ == "__main__":
    stock_name = input("Enter stock symbol: ").upper()
    start_date = input("Enter start date (YYYY-MM-DD): ")
    end_date = input("Enter end date (YYYY-MM-DD): ")

    data = get_stock_data(stock_name, start_date, end_date)
    print(data.head())
