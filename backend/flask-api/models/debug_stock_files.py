"""
Debug script to test stock file matching
Save this as debug_stock_files.py in your project directory
"""

import os
import pandas as pd
import sys

def normalize_stock_symbol(symbol):
    """Normalize stock symbol to match expected format in file mapping."""
    if symbol is None:
        return ""
    # Remove any dots and convert to lowercase for matching
    return symbol.lower().replace('.', '')

def debug_folder_contents(folder_path):
    """Print the contents of the folder and analyze CSV files."""
    if not os.path.exists(folder_path):
        print(f"Error: Folder path {folder_path} does not exist!")
        return False
    
    print(f"\n==== Analyzing folder: {folder_path} ====")
    files = os.listdir(folder_path)
    csv_files = [f for f in files if f.endswith('.csv')]
    
    print(f"Found {len(files)} total files")
    print(f"Found {len(csv_files)} CSV files: {csv_files}")
    
    stock_mapping = {}
    
    for csv_file in csv_files:
        file_path = os.path.join(folder_path, csv_file)
        base_name = csv_file.split('_')[0]
        normalized_name = normalize_stock_symbol(base_name)
        
        print(f"\nAnalyzing file: {csv_file}")
        print(f"  Base name: {base_name}")
        print(f"  Normalized name: {normalized_name}")
        
        try:
            # Read the first few rows of the CSV
            df = pd.read_csv(file_path, nrows=5)
            print(f"  CSV columns: {df.columns.tolist()}")
            
            # Check for stock identifier column
            stock_col = None
            for col in df.columns:
                if 'stock' in col.lower() or 'symbol' in col.lower() or 'ticker' in col.lower():
                    stock_col = col
                    break
            
            if stock_col:
                unique_stocks = df[stock_col].unique()
                print(f"  Stock identifier column: {stock_col}")
                print(f"  Unique stock identifiers: {unique_stocks}")
            
            # Check for price column
            price_col = None
            for col in df.columns:
                if 'close' in col.lower() or 'price' in col.lower():
                    price_col = col
                    break
            
            if price_col:
                print(f"  Price column: {price_col}")
                print(f"  Price range: {df[price_col].min()} - {df[price_col].max()}")
            
            # Add to mapping
            stock_mapping[normalized_name] = {
                "path": file_path,
                "original_name": base_name,
                "columns": df.columns.tolist()
            }
            
        except Exception as e:
            print(f"  Error reading file: {e}")
    
    print("\n==== Testing stock name matching ====")
    test_stocks = ["Reliance", "RELIANCE", "Reliance.NS", "RELIANCE.NS", "reliance", "reliance.ns"]
    
    for test_stock in test_stocks:
        normalized = normalize_stock_symbol(test_stock)
        found = normalized in stock_mapping
        print(f"Stock name: '{test_stock}' -> normalized: '{normalized}' -> match found: {found}")
    
    print("\n==== Stock mapping summary ====")
    print(f"Total mappings: {len(stock_mapping)}")
    for key, value in stock_mapping.items():
        print(f"  {key} -> {value['original_name']}")
    
    return stock_mapping

if __name__ == '__main__':
    # Use the folder path provided as command line argument or use default
    if len(sys.argv) > 1:
        folder_path = sys.argv[1]
    else:
        folder_path = "C:\\Users\\vishw\\Downloads\\Capstone_Project\\Riskos\\backend\\flask-api\\Scripts"
    
    debug_folder_contents(folder_path)
    print("\nPlease copy and paste the output above when reporting the issue!")