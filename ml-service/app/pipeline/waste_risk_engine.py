"""
Layer 6: Waste Risk Engine
Calculates Expected Waste (kg), Waste %, Spoilage Probability, Remaining Shelf Life, and Risk Level.
"""

import math
from typing import Dict, Any
from app.pipeline.schema import SupplyNodePayload


class WasteRiskEngine:
    """Calculates granular perishability degradation and spoilage risks."""

    # Base shelf life in optimal conditions (Hours)
    BASE_SHELF_LIFE_HOURS = {
        "Tomato": 168.0,       # 7 days
        "Banana": 120.0,       # 5 days
        "Mango": 144.0,        # 6 days
        "Green Chilli": 240.0, # 10 days
        "Potato": 720.0,       # 30 days
        "Onion": 720.0,        # 30 days
        "Apple": 480.0,        # 20 days
        "Ginger": 720.0,       # 30 days
        "Garlic": 1440.0,      # 60 days
        "Turmeric": 1440.0,    # 60 days
        "Wheat": 4320.0,       # 180 days
        "Rice": 4320.0,        # 180 days
    }

    # Temperature sensitivity multiplier Q10
    Q10_TEMP_COEFFICIENT = {
        "Tomato": 2.2,
        "Banana": 2.5,
        "Mango": 2.4,
        "Green Chilli": 2.0,
        "Potato": 1.5,
        "Onion": 1.4,
        "Apple": 1.8,
        "Ginger": 1.4,
        "Garlic": 1.3,
        "Turmeric": 1.3,
        "Wheat": 1.2,
        "Rice": 1.2,
    }

    def evaluate(self, payload: SupplyNodePayload) -> Dict[str, Any]:
        commodity = payload.commodity
        base_life = self.BASE_SHELF_LIFE_HOURS.get(commodity, 168.0)
        q10 = self.Q10_TEMP_COEFFICIENT.get(commodity, 2.0)

        # 1. Temperature Acceleration Factor (Arrhenius / Q10 law)
        sensor_temp = payload.iot_sensors.temperature_c if payload.iot_sensors.temperature_c is not None else 28.0
        
        # Effective temperature depending on storage environment
        if payload.storage_type == "cold_storage":
            effective_temp = min(sensor_temp, 4.0)
            optimal_temp = 4.0
        elif payload.storage_type == "warehouse":
            effective_temp = max(16.0, sensor_temp - 4.0)
            optimal_temp = 12.0
        else:  # open_field
            effective_temp = sensor_temp
            optimal_temp = 12.0

        delta_temp = max(0.0, effective_temp - optimal_temp)
        temp_decay_multiplier = math.pow(q10, delta_temp / 10.0)

        # 2. Humidity Impact (extreme dryness causes moisture loss, extreme dampness causes mold)
        humidity = payload.iot_sensors.humidity_pct if payload.iot_sensors.humidity_pct is not None else 75.0
        humidity_penalty = 1.0
        if humidity < 70.0:
            humidity_penalty += (70.0 - humidity) * 0.015  # Moisture loss
        elif humidity > 92.0:
            humidity_penalty += (humidity - 92.0) * 0.02   # Fungal / bacterial mold risk

        # 3. Ethylene Gas Auto-Catalysis (Ripening hormone)
        ethylene = payload.iot_sensors.ethylene_ppm or 0.0
        ethylene_penalty = 1.0 + (ethylene * 2.5)

        # 4. Quality Grade Factor
        grade_factor = 1.0
        if "B" in payload.quality_grade:
            grade_factor = 1.2
        elif "C" in payload.quality_grade:
            grade_factor = 1.6

        # Total Accelerated Age (Hours)
        elapsed_hours = payload.hours_in_storage
        effective_hours_used = elapsed_hours * temp_decay_multiplier * humidity_penalty * ethylene_penalty * grade_factor

        # Remaining Shelf Life
        remaining_hours = max(0.0, base_life - effective_hours_used)

        # Spoilage Probability (Sigmoid curve based on percentage of life consumed)
        consumed_ratio = min(2.0, effective_hours_used / base_life)
        spoilage_prob = 1.0 / (1.0 + math.exp(-6.0 * (consumed_ratio - 0.75)))
        spoilage_prob = min(0.99, max(0.01, round(spoilage_prob, 3)))

        # Expected Waste in kg and %
        waste_pct = round(spoilage_prob * 100.0, 1)
        expected_waste_kg = round(payload.quantity_kg * spoilage_prob, 1)

        # Risk Level Categorization
        if remaining_hours < 24.0 or spoilage_prob > 0.65:
            risk_level = "critical"
        elif remaining_hours < 48.0 or spoilage_prob > 0.40:
            risk_level = "high"
        elif remaining_hours < 96.0 or spoilage_prob > 0.20:
            risk_level = "medium"
        else:
            risk_level = "low"

        return {
            "expected_waste_kg": expected_waste_kg,
            "waste_percentage": waste_pct,
            "spoilage_probability": spoilage_prob,
            "remaining_shelf_life_hours": round(remaining_hours, 1),
            "risk_level": risk_level,
            "temp_decay_multiplier": round(temp_decay_multiplier, 2),
        }
