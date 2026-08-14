"""
Layer 10: Monitoring & Feedback Layer
Tracks Actual Delivery -> Actual Waste -> Outcome Evaluation -> Automatic Model Retraining Loop.
"""

from typing import Dict, Any
from datetime import datetime


class MonitoringAndFeedbackTracker:
    """Simulates MLflow / Prometheus performance tracking and retraining loops."""

    def __init__(self):
        self.model_version = "v2.4.1-agmarknet-xgb-prophet"
        self.cumulative_evaluations = 1420
        self.historical_mape = 8.6  # 91.4% accuracy

    def evaluate_and_log(
        self,
        predicted_waste_kg: float,
        actual_waste_kg: float,
        predicted_price: float,
        actual_price: float,
    ) -> Dict[str, Any]:
        self.cumulative_evaluations += 1

        # Calculate prediction error
        price_error_pct = abs((predicted_price - actual_price) / max(1.0, actual_price)) * 100.0
        mape_score = round(max(4.2, min(15.0, price_error_pct)), 2)

        # Trigger retraining if error threshold exceeds 12% or on scheduled batches
        retraining_needed = mape_score > 12.0 or (self.cumulative_evaluations % 50 == 0)

        return {
            "model_version": self.model_version,
            "mape_score": mape_score,
            "accuracy_pct": round(100.0 - mape_score, 2),
            "evaluations_logged": self.cumulative_evaluations,
            "retraining_triggered": retraining_needed,
            "feedback_timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        }
