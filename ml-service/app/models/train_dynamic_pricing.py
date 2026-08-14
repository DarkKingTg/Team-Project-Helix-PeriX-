"""
Training script for Multi-Variable Dynamic Pricing & Spoilage Model
Features: Commodity, Original Price, Shelf-Life Hours, Storage Temperature, Humidity, Stock Quantity
Output: ml-service/app/trained_models/dynamic_pricing_xgb.pkl
"""

import os
import math
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
import joblib

COMMODITIES = [
    "Tomato", "Potato", "Onion", "Banana", "Mango", "Green Chilli",
    "Strawberry", "Milk", "Spinach", "Apple", "Wheat", "Rice",
    "Garlic", "Ginger", "Orange", "Cabbage", "Carrot", "Cauliflower", "Turmeric"
]

Q10_COEFFICIENTS = {
    "Tomato": 2.4,
    "Banana": 2.8,
    "Green Chilli": 2.2,
    "Strawberry": 3.0,
    "Milk": 2.9,
    "Spinach": 3.2,
    "Apple": 1.8,
    "Orange": 2.0,
    "Potato": 1.5,
    "Onion": 1.4,
    "Wheat": 1.2,
    "Rice": 1.2,
    "Garlic": 1.4,
    "Ginger": 1.6,
    "Cabbage": 2.3,
    "Carrot": 2.1,
    "Cauliflower": 2.4,
    "Mango": 2.5,
    "Turmeric": 1.3,
}

BASE_SHELF_HOURS = {
    "Tomato": 168.0,
    "Banana": 120.0,
    "Green Chilli": 240.0,
    "Strawberry": 72.0,
    "Milk": 48.0,
    "Spinach": 48.0,
    "Apple": 480.0,
    "Orange": 360.0,
    "Potato": 720.0,
    "Onion": 720.0,
    "Wheat": 4320.0,
    "Rice": 4320.0,
    "Garlic": 720.0,
    "Ginger": 480.0,
    "Cabbage": 168.0,
    "Carrot": 240.0,
    "Cauliflower": 144.0,
    "Mango": 144.0,
    "Turmeric": 1440.0,
}

COMMODITY_TO_IDX = {c: i for i, c in enumerate(COMMODITIES)}

def generate_training_data(n_samples=25000, seed=42):
    np.random.seed(seed)
    records = []

    for _ in range(n_samples):
        comm = np.random.choice(COMMODITIES)
        comm_idx = COMMODITY_TO_IDX[comm]
        q10 = Q10_COEFFICIENTS.get(comm, 2.0)
        base_life = BASE_SHELF_HOURS.get(comm, 168.0)

        orig_price = float(np.random.uniform(15.0, 180.0))
        hours = float(np.random.uniform(1.0, min(base_life, 240.0)))
        temp_c = float(np.random.uniform(2.0, 42.0))
        humidity = float(np.random.uniform(30.0, 95.0))
        quantity = float(np.random.uniform(10.0, 2500.0))

        # Arrhenius respiration decay multiplier
        opt_temp = 4.0 if comm not in ["Banana", "Mango"] else 13.0
        delta_temp = max(0.0, temp_c - opt_temp)
        temp_decay_multiplier = math.pow(q10, delta_temp / 10.0)

        # Effective remaining shelf life after thermal acceleration
        effective_hours = max(0.5, hours / temp_decay_multiplier)

        # Base time decay discount (Hyperbolic tangent curve)
        # As effective_hours approaches 0, discount climbs towards 75%
        time_discount = 75.0 * (1.0 - math.tanh(effective_hours / 32.0))

        # Thermal stress penalty if produce is kept in extreme heat (> 30°C)
        thermal_penalty = 0.0
        if temp_c > 28.0 and effective_hours < 48.0:
            thermal_penalty = min(20.0, (temp_c - 28.0) * 1.2)

        # Stock quantity clearance pressure
        qty_factor = min(12.0, (quantity / 1500.0) * 8.0)

        # Total optimal discount
        discount_pct = time_discount + thermal_penalty + qty_factor
        discount_pct = float(np.clip(discount_pct, 2.0, 80.0))
        discount_pct = round(discount_pct + np.random.normal(0, 0.5), 1)
        discount_pct = float(np.clip(discount_pct, 2.0, 80.0))

        records.append({
            "commodity_idx": comm_idx,
            "original_price": orig_price,
            "hours_to_expiry": hours,
            "temperature_c": temp_c,
            "humidity_pct": humidity,
            "quantity_kg": quantity,
            "discount_pct": discount_pct,
        })

    return pd.DataFrame(records)

def train_and_save_model():
    print("Generating synthetic thermodynamic decay dataset...")
    df = generate_training_data(n_samples=30000)

    feature_cols = [
        "commodity_idx",
        "original_price",
        "hours_to_expiry",
        "temperature_c",
        "humidity_pct",
        "quantity_kg",
    ]
    X = df[feature_cols]
    y = df["discount_pct"]

    print("Training GradientBoostingRegressor model...")
    model = GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=5,
        random_state=42
    )
    model.fit(X, y)

    score = model.score(X, y)
    print(f"Model R^2 Score on Training Set: {score:.4f}")

    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trained_models"))
    os.makedirs(output_dir, exist_ok=True)
    model_path = os.path.join(output_dir, "dynamic_pricing_xgb.pkl")

    artifact = {
        "model": model,
        "feature_cols": feature_cols,
        "commodities": COMMODITIES,
        "commodity_to_idx": COMMODITY_TO_IDX,
        "q10_coefficients": Q10_COEFFICIENTS,
        "base_shelf_hours": BASE_SHELF_HOURS,
    }

    joblib.dump(artifact, model_path)
    print(f"Trained model saved successfully to: {model_path}")

if __name__ == "__main__":
    train_and_save_model()
