"""
Dynamic Pricing Engine for near-expiry goods.
Must resolve in < 200ms per TRD requirements.
"""

import math
from typing import Dict, Any


class DynamicPricingEngine:
    """
    Calculates optimal markdown prices for perishable goods
    approaching expiration. Designed for sub-200ms latency.
    """

    # Commodity-specific decay rates (how fast value drops)
    DECAY_RATES = {
        "Tomato": 0.15,      # High perishability
        "Banana": 0.12,
        "Mango": 0.13,
        "Potato": 0.05,      # Low perishability
        "Onion": 0.06,
        "Wheat": 0.02,       # Very low perishability
        "Rice": 0.02,
        "Ginger": 0.04,
        "Chilli": 0.08,
        "Turmeric": 0.03,
    }

    # Demand elasticity by commodity
    DEMAND_ELASTICITY = {
        "Tomato": 1.5,   # Very price-sensitive
        "Potato": 1.2,
        "Onion": 1.4,
        "Wheat": 0.6,    # Less price-sensitive (staple)
        "Rice": 0.5,
        "Banana": 1.3,
        "Mango": 1.8,    # Premium fruit, elastic
    }

    def calculate(
        self,
        commodity: str,
        current_price: float,
        days_to_expiry: int,
        quantity: float,
    ) -> Dict[str, Any]:
        """
        Calculate the optimal markdown price.

        Algorithm:
        1. Calculate time-decay discount based on commodity perishability
        2. Apply quantity pressure (more stock = more aggressive discount)
        3. Apply demand elasticity to maximize revenue recovery
        4. Set urgency level for POS integration
        """
        decay_rate = self.DECAY_RATES.get(commodity, 0.08)
        elasticity = self.DEMAND_ELASTICITY.get(commodity, 1.0)

        # 1. Time-decay discount
        # Exponential decay: discount increases rapidly near expiry
        if days_to_expiry <= 0:
            time_discount = 0.75  # 75% off if already expired
        else:
            time_discount = 1 - math.exp(-decay_rate * (14 - min(days_to_expiry, 14)))
        time_discount = max(0, min(time_discount, 0.75))

        # 2. Quantity pressure
        # More stock remaining = more aggressive markdown
        qty_factor = min(0.2, quantity / 5000 * 0.2)

        # 3. Demand elasticity adjustment
        # Higher elasticity = discount will drive more sales
        elasticity_bonus = (elasticity - 1) * 0.05

        # 4. Total discount
        total_discount = time_discount + qty_factor + elasticity_bonus
        total_discount = max(0.02, min(total_discount, 0.75))  # Cap between 2% and 75%

        recommended_price = round(current_price * (1 - total_discount), 2)

        # Determine urgency
        if days_to_expiry <= 1:
            urgency = "critical"
            reasoning = (
                f"CRITICAL: {commodity} expires within 24 hours. "
                f"Aggressive {total_discount*100:.0f}% markdown to clear {quantity}kg immediately. "
                f"Consider donation dispatch if unsold."
            )
        elif days_to_expiry <= 3:
            urgency = "high"
            reasoning = (
                f"HIGH PRIORITY: {days_to_expiry} days remaining. "
                f"{total_discount*100:.0f}% discount recommended. "
                f"{'High' if elasticity > 1.2 else 'Moderate'} demand elasticity suggests good sales response."
            )
        elif days_to_expiry <= 7:
            urgency = "medium"
            reasoning = (
                f"MODERATE: {days_to_expiry} days to expiry. "
                f"Proactive {total_discount*100:.0f}% markdown to optimize sell-through rate."
            )
        else:
            urgency = "low"
            reasoning = (
                f"LOW: {days_to_expiry} days shelf life remaining. "
                f"Optional {total_discount*100:.0f}% promotional discount to accelerate inventory flow."
            )

        return {
            "commodity": commodity,
            "original_price": current_price,
            "recommended_price": recommended_price,
            "discount_percentage": round(total_discount * 100, 1),
            "urgency": urgency,
            "reasoning": reasoning,
        }
