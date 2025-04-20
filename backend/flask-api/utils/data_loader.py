import os
import pandas as pd

def load_stock_data(folder_path):
    stock_data = {}
    for file in os.listdir(folder_path):
        if file.endswith("_data.csv"):
            df = pd.read_csv(os.path.join(folder_path, file))
            df["Close"] = pd.to_numeric(df["Close"], errors="coerce")
            df.dropna(inplace=True)
            df["Date"] = pd.to_datetime(df["Date"])
            df.set_index("Date", inplace=True)
            stock_name = file.replace("_data.csv", "")
            stock_data[stock_name] = df["Close"]
    return pd.DataFrame(stock_data)
