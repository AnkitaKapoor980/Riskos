import pandas as pd
import time
from Data.get_one_data import get_stock_data  # Import your existing function

# List of 50 Nifty stock symbols
nifty50_stocks = [
    "RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "TCS.NS", "ICICIBANK.NS", 
    "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
    "LT.NS", "AXISBANK.NS", "ASIANPAINT.NS", "BAJFINANCE.NS", "HCLTECH.NS",
    "MARUTI.NS", "TITAN.NS", "SUNPHARMA.NS", "NESTLEIND.NS", "ULTRACEMCO.NS",
    "WIPRO.NS", "TATASTEEL.NS", "TECHM.NS", "INDUSINDBK.NS", "POWERGRID.NS",
    "NTPC.NS", "TATAMOTORS.NS", "BAJAJFINSV.NS", "JSWSTEEL.NS", "GRASIM.NS",
    "CIPLA.NS", "HDFCLIFE.NS", "HINDALCO.NS", "DIVISLAB.NS", "ADANIENT.NS",
    "DRREDDY.NS", "SBILIFE.NS", "COALINDIA.NS", "BRITANNIA.NS", "EICHERMOT.NS",
    "APOLLOHOSP.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS", "UPL.NS", "ONGC.NS",
    "BPCL.NS", "TATACONSUM.NS", "ADANIPORTS.NS", "M&M.NS", "SHREECEM.NS"
]

def fetch_nifty50_data(start_date, end_date, save_combined=True):
    all_data = []
    
    for stock in nifty50_stocks:
        print(f"\nFetching data for {stock}...")
        try:
            df = get_stock_data(stock, start_date, end_date)
            if df is not None:
                all_data.append(df)
                time.sleep(2)  # Avoid API rate limits
        except Exception as e:
            print(f"Error fetching {stock}: {e}")

    if save_combined and all_data:
        combined_df = pd.concat(all_data)
        file_name = f"Nifty50_data_{start_date}_to_{end_date}.csv"
        combined_df.to_csv(file_name, index=False)
        print(f"\n✅ All Nifty 50 data saved to {file_name}")

# Example usage
if __name__ == "__main__":
    start_date = input("Enter start date (YYYY-MM-DD): ").strip()
    end_date = input("Enter end date (YYYY-MM-DD): ").strip()
    
    fetch_nifty50_data(start_date, end_date)
