"""
Data Preprocessing, Cleaning, and Feature Engineering Pipeline.
Transforms raw Agmarknet agricultural records and perishable logs into
production-ready datasets for XGBoost price prediction, Prophet demand forecasting,
and dynamic pricing algorithms.
"""

import os
import sys
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any

# Fix Windows console unicode issues
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))


class DataPreprocessor:
    """
    Cleans raw Agmarknet records, handles outliers, computes cyclical & rolling features,
    and splits data for AI model training.
    """

    def __init__(self, raw_path: str = None):
        self.raw_path = raw_path or os.path.join(DATA_DIR, "raw_agmarknet_data.csv")
        self.cleaned_path = os.path.join(DATA_DIR, "cleaned_agmarknet_dataset.csv")
        self.train_path = os.path.join(DATA_DIR, "train_data.csv")
        self.test_path = os.path.join(DATA_DIR, "test_data.csv")
        self.legacy_path = os.path.join(DATA_DIR, "agmarknet_real_data.csv")

    def clean_and_preprocess(self, df_raw: pd.DataFrame = None) -> pd.DataFrame:
        """
        Executes full preprocessing pipeline:
        1. Type conversion & string trimming
        2. Outlier & anomaly cleaning (IQR bounds, min/max bounds)
        3. Unit normalization (Quintal to ₹/kg, Tonnes to kg)
        4. Temporal & cyclical sine/cosine feature extraction
        5. Rolling window lag statistics & supply pressure indices
        """
        if df_raw is None:
            if not os.path.exists(self.raw_path):
                from app.data.dataset_builder import generate_all_raw_datasets
                df_raw, _ = generate_all_raw_datasets()
            else:
                df_raw = pd.read_csv(self.raw_path)

        df = df_raw.copy()

        # Step 1: Standardize text casing & trim
        for col in ["state", "district", "market", "commodity", "variety"]:
            if col in df.columns:
                df[col] = df[col].astype(str).str.strip()

        # Parse arrival_date
        df["arrival_date"] = pd.to_datetime(df["arrival_date"])
        df = df.sort_values(by=["commodity", "market", "arrival_date"]).reset_index(drop=True)

        # Step 2: Validate numeric columns and filter anomalies
        numeric_cols = ["min_price", "max_price", "modal_price", "arrivals_in_tonnes"]
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # Drop rows with NaN or zero/negative prices
        df = df.dropna(subset=numeric_cols)
        df = df[(df["modal_price"] > 0) & (df["arrivals_in_tonnes"] > 0)].copy()

        # Repair min_price / max_price consistency
        df["min_price"] = np.minimum(df["min_price"], df["modal_price"])
        df["max_price"] = np.maximum(df["max_price"], df["modal_price"])

        # Outlier filtering per commodity using IQR
        cleaned_records = []
        for comm, group in df.groupby("commodity"):
            q1 = group["modal_price"].quantile(0.01)
            q3 = group["modal_price"].quantile(0.99)
            iqr = q3 - q1
            lower_bound = max(100, q1 - 2.5 * iqr)
            upper_bound = q3 + 2.5 * iqr

            valid_group = group[(group["modal_price"] >= lower_bound) & (group["modal_price"] <= upper_bound)]
            cleaned_records.append(valid_group)

        df = pd.concat(cleaned_records).sort_values(by=["arrival_date", "commodity"]).reset_index(drop=True)

        # Step 3: Unit Normalization
        # 1 Quintal = 100 kg. Therefore ₹/quintal / 100 = ₹/kg
        df["modal_price_per_kg"] = round(df["modal_price"] / 100.0, 2)
        df["min_price_per_kg"] = round(df["min_price"] / 100.0, 2)
        df["max_price_per_kg"] = round(df["max_price"] / 100.0, 2)
        df["arrivals_in_kg"] = round(df["arrivals_in_tonnes"] * 1000.0, 1)

        # Step 4: Temporal & Cyclical Feature Engineering
        df["year"] = df["arrival_date"].dt.year
        df["month"] = df["arrival_date"].dt.month
        df["day"] = df["arrival_date"].dt.day
        df["day_of_week"] = df["arrival_date"].dt.dayofweek
        df["day_of_year"] = df["arrival_date"].dt.dayofyear
        df["is_weekend"] = df["day_of_week"].isin([5, 6]).astype(int)
        df["quarter"] = df["arrival_date"].dt.quarter

        # Smooth periodic trigonometric representations
        df["sin_month"] = np.round(np.sin(2 * np.pi * df["month"] / 12), 4)
        df["cos_month"] = np.round(np.cos(2 * np.pi * df["month"] / 12), 4)
        df["sin_dow"] = np.round(np.sin(2 * np.pi * df["day_of_week"] / 7), 4)
        df["cos_dow"] = np.round(np.cos(2 * np.pi * df["day_of_week"] / 7), 4)

        # Step 5: Market Dynamics & Rolling Window Lag Features
        df["price_spread_per_kg"] = round(df["max_price_per_kg"] - df["min_price_per_kg"], 2)
        df["price_spread_pct"] = round((df["price_spread_per_kg"] / df["modal_price_per_kg"]) * 100, 2)
        df["supply_pressure_index"] = round(df["arrivals_in_tonnes"] / (df["modal_price_per_kg"] + 1e-5), 3)

        # Rolling statistics per (commodity, market)
        df_sorted = df.sort_values(by=["commodity", "market", "arrival_date"]).copy()
        
        # Grouped rolling averages
        grouped = df_sorted.groupby(["commodity", "market"])
        df_sorted["rolling_price_7d"] = grouped["modal_price_per_kg"].transform(
            lambda s: s.rolling(window=7, min_periods=1).mean().round(2)
        )
        df_sorted["rolling_price_30d"] = grouped["modal_price_per_kg"].transform(
            lambda s: s.rolling(window=30, min_periods=1).mean().round(2)
        )
        df_sorted["rolling_arrivals_7d"] = grouped["arrivals_in_tonnes"].transform(
            lambda s: s.rolling(window=7, min_periods=1).mean().round(1)
        )
        
        # 7-day price momentum (% change)
        df_sorted["price_momentum_7d"] = grouped["modal_price_per_kg"].transform(
            lambda s: s.pct_change(periods=7).fillna(0.0).mul(100).round(2)
        )

        df = df_sorted.sort_values(by=["arrival_date", "commodity", "market"]).reset_index(drop=True)
        return df

    def split_and_save(self, df: pd.DataFrame, train_ratio: float = 0.8) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Splits dataset chronologically (train/test) to preserve time-series integrity
        and saves all clean CSV artifacts.
        """
        # Save full cleaned dataset
        df.to_csv(self.cleaned_path, index=False)
        # Update legacy dataset for backward-compatibility
        df.to_csv(self.legacy_path, index=False)

        # Chronological train/test split per commodity
        train_list = []
        test_list = []

        for comm, group in df.groupby("commodity"):
            group_sorted = group.sort_values(by="arrival_date")
            split_idx = int(len(group_sorted) * train_ratio)
            train_list.append(group_sorted.iloc[:split_idx])
            test_list.append(group_sorted.iloc[split_idx:])

        df_train = pd.concat(train_list).sort_values(by="arrival_date").reset_index(drop=True)
        df_test = pd.concat(test_list).sort_values(by="arrival_date").reset_index(drop=True)

        df_train.to_csv(self.train_path, index=False)
        df_test.to_csv(self.test_path, index=False)

        print(f"✅ Full Cleaned Dataset: {len(df)} records -> {self.cleaned_path}")
        print(f"✅ Training Split: {len(df_train)} records -> {self.train_path}")
        print(f"✅ Testing Split: {len(df_test)} records -> {self.test_path}")

        return df_train, df_test

    def get_dataset_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generates statistical overview of the preprocessed dataset."""
        return {
            "total_records": len(df),
            "date_range": f"{df['arrival_date'].min().strftime('%Y-%m-%d')} to {df['arrival_date'].max().strftime('%Y-%m-%d')}",
            "commodities_count": df["commodity"].nunique(),
            "commodities": list(df["commodity"].unique()),
            "states_count": df["state"].nunique(),
            "states": list(df["state"].unique()),
            "markets_count": df["market"].nunique(),
            "avg_modal_price_per_kg": round(float(df["modal_price_per_kg"].mean()), 2),
            "avg_arrivals_tonnes": round(float(df["arrivals_in_tonnes"].mean()), 2),
        }


def run_pipeline():
    preprocessor = DataPreprocessor()
    df_cleaned = preprocessor.clean_and_preprocess()
    df_train, df_test = preprocessor.split_and_save(df_cleaned)
    summary = preprocessor.get_dataset_summary(df_cleaned)

    print("\n📊 Dataset Preprocessing Summary:")
    for k, v in summary.items():
        print(f"  • {k}: {v}")


if __name__ == "__main__":
    run_pipeline()
