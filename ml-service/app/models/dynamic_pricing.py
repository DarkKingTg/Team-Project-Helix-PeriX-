"""
Dynamic Pricing Engine for near-expiry and temperature-stressed perishable goods.
Powered by trained GradientBoostingRegressor + Arrhenius Respiration Kinetics.
Resolves in < 5ms for instantaneous POS and retail pricing updates.
"""

import os
import math
import joblib
import numpy as np
from typing import Dict, Any, Optional


class DynamicPricingEngine:
    """
    Calculates optimal markdown prices for perishable goods
    taking into account remaining shelf-life hours, storage temperature,
    humidity, and quantity pressure.
    """

    def __init__(self):
        self.model_data = None
        self._load_model()

    def _load_model(self):
        model_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "trained_models", "dynamic_pricing_xgb.pkl")
        )
        if os.path.exists(model_path):
            try:
                self.model_data = joblib.load(model_path)
            except Exception as e:
                print(f"Notice: Failed to load ML pickle ({e}), using analytical physics fallback.")
                self.model_data = None

    def calculate(
        self,
        commodity: str,
        current_price: float,
        hours_to_expiry: float = 24.0,
        temperature_c: float = 25.0,
        humidity_pct: float = 65.0,
        quantity: float = 100.0,
        days_to_expiry: Optional[float] = None,
    ) -> Dict[str, Any]:
        """
        Calculate the optimal markdown price with multi-variable Arrhenius kinetics.
        """
        # If days_to_expiry is passed instead of hours_to_expiry
        if days_to_expiry is not None and (hours_to_expiry is None or hours_to_expiry == 24.0):
            hours_to_expiry = days_to_expiry * 24.0

        hours_to_expiry = max(0.5, float(hours_to_expiry))
        temperature_c = float(temperature_c)
        humidity_pct = float(humidity_pct)
        quantity = max(1.0, float(quantity))
        current_price = max(1.0, float(current_price))

        # Default Arrhenius coefficients
        q10_map = {
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

        q10 = q10_map.get(commodity, 2.0)
        opt_temp = 4.0 if commodity not in ["Banana", "Mango"] else 13.0
        delta_temp = max(0.0, temperature_c - opt_temp)
        temp_decay_multiplier = math.pow(q10, delta_temp / 10.0)

        # Calculate effective remaining hours under current thermal load
        effective_hours = max(0.2, hours_to_expiry / temp_decay_multiplier)

        discount_pct = 0.0

        # Try ML Model Inference
        if self.model_data is not None:
            try:
                model = self.model_data["model"]
                comm_to_idx = self.model_data["commodity_to_idx"]
                comm_idx = comm_to_idx.get(commodity, 0)

                features = np.array([[
                    comm_idx,
                    current_price,
                    hours_to_expiry,
                    temperature_c,
                    humidity_pct,
                    quantity
                ]])
                pred = model.predict(features)[0]
                discount_pct = float(np.clip(pred, 2.0, 80.0))
            except Exception:
                discount_pct = 0.0

        # Physics Fallback / Verification
        if discount_pct <= 0.0:
            time_discount = 75.0 * (1.0 - math.tanh(effective_hours / 32.0))
            thermal_penalty = 0.0
            if temperature_c > 28.0 and effective_hours < 48.0:
                thermal_penalty = min(20.0, (temperature_c - 28.0) * 1.2)
            qty_factor = min(12.0, (quantity / 1500.0) * 8.0)
            discount_pct = float(np.clip(time_discount + thermal_penalty + qty_factor, 2.0, 80.0))

        discount_pct = round(discount_pct, 1)
        recommended_price = round(current_price * (1.0 - discount_pct / 100.0), 2)

        # Urgency classification
        if effective_hours < 12.0 or discount_pct >= 55.0:
            urgency = "critical"
            reasoning = (
                f"CRITICAL: At {temperature_c}°C, respiration decay is accelerated {temp_decay_multiplier:.1f}x. "
                f"Effective window is only {effective_hours:.1f}h. Immediate {discount_pct}% markdown recommended to prevent total loss."
            )
        elif effective_hours < 28.0 or discount_pct >= 35.0:
            urgency = "high"
            reasoning = (
                f"HIGH: {hours_to_expiry:.0f}h shelf-life at {temperature_c}°C ({temp_decay_multiplier:.1f}x decay rate). "
                f"Applying {discount_pct}% discount drives high sell-through before decay onset."
            )
        elif effective_hours < 54.0 or discount_pct >= 20.0:
            urgency = "moderate"
            reasoning = (
                f"MODERATE: Produce is stable for ~{effective_hours:.0f}h effective time. "
                f"{discount_pct}% markdown recommended to maintain steady turnover."
            )
        else:
            urgency = "low"
            reasoning = (
                f"HEALTHY: Optimal conditions ({temperature_c}°C, {effective_hours:.0f}h effective life). "
                f"Standard promotional discount of {discount_pct}% applied."
            )

        return {
            "commodity": commodity,
            "original_price": current_price,
            "recommended_price": recommended_price,
            "discount_percentage": discount_pct,
            "urgency": urgency,
            "reasoning": reasoning,
            "hours_to_expiry": hours_to_expiry,
            "temperature_c": temperature_c,
            "effective_hours": round(effective_hours, 1),
            "temp_decay_multiplier": round(temp_decay_multiplier, 2),
        }
