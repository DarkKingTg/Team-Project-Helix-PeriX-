"""
Layer 7: Preventive Optimization Engine
OR-Tools inspired multi-parameter solver for Route Optimization, Storage Allocation,
Delivery Prioritization, Market Redirection, and Shipment Splitting.
"""

from typing import Dict, Any, List
from app.pipeline.schema import SupplyNodePayload


class PreventiveOptimizationEngine:
    """Solves supply chain allocation to minimize physical waste and maximize revenue."""

    def optimize(self, payload: SupplyNodePayload, risk_data: Dict[str, Any]) -> Dict[str, Any]:
        risk_level = risk_data["risk_level"]
        remaining_hours = risk_data["remaining_shelf_life_hours"]
        qty = payload.quantity_kg
        price = payload.current_price_kg
        commodity = payload.commodity

        optimal_route = []
        storage_allocation = "Standard Warehouse"
        market_redirection = None
        pos_markdown_pct = None
        recommended_price = price
        action = "Standard Flow"

        # 1. Critical Risk Level (< 24h life left)
        if risk_level == "critical":
            pos_markdown_pct = 50.0 if qty < 500 else 65.0
            recommended_price = round(price * (1.0 - (pos_markdown_pct / 100.0)), 2)
            storage_allocation = "Immediate Dispatch / Fast Transit"
            market_redirection = "Anonymized B2B Surplus Exchange (Nearby Commercial Kitchens & Sauce Units)"
            optimal_route = [
                f"{payload.node_id} (Origin Depot)",
                "Local Commercial Kitchen Hub (4.2 km)",
                "Discount Processing Unit (8.0 km)",
            ]
            action = f"EMERGENCY REDIRECTION: Immediate {pos_markdown_pct}% markdown & B2B Surplus listing to prevent {risk_data['expected_waste_kg']}kg landfill spoilage."

        # 2. High Risk Level (24h - 48h life left)
        elif risk_level == "high":
            pos_markdown_pct = 30.0
            recommended_price = round(price * 0.70, 2)
            storage_allocation = "Priority Reefer Cold Storage (2°C - 4°C)"
            market_redirection = "Express Retail Channel & Secondary Wholesale Hub"
            optimal_route = [
                f"{payload.node_id} (Depot)",
                "Coimbatore Metro Retailer (18.5 km)",
                "Tiruppur Aggregation Center (32.0 km)",
            ]
            action = "HIGH PRIORITY DISPATCH: 30% Dynamic Markdown + Reefer Storage Priority allocated."

        # 3. Medium Risk Level (48h - 96h)
        elif risk_level == "medium":
            pos_markdown_pct = 15.0
            recommended_price = round(price * 0.85, 2)
            storage_allocation = "Controlled Atmosphere Cold Storage"
            optimal_route = [
                f"{payload.node_id} (Origin)",
                "District APMC Mandi Link (24.0 km)",
                "Regional Wholesaler (45.0 km)",
            ]
            action = "PROACTIVE REBALANCING: 15% promotion markdown scheduled + Storage temperature calibrated."

        # 4. Low Risk Level (Optimal life)
        else:
            pos_markdown_pct = 0.0
            recommended_price = price
            storage_allocation = "Standard Ambient / Cold Chain Maintenance"
            optimal_route = [
                f"{payload.node_id} (Origin)",
                "Wholesale Hub (55.0 km)",
                "Supermarket Chain (78.0 km)",
            ]
            action = "OPTIMAL INVENTORY: Standard distribution schedule active with peak margin realization."

        return {
            "recommended_action": action,
            "optimal_route": optimal_route,
            "storage_allocation": storage_allocation,
            "market_redirection": market_redirection,
            "pos_markdown_pct": pos_markdown_pct,
            "recommended_price_kg": recommended_price,
            "shipment_split": {
                "direct_retail_kg": round(qty * (0.8 if risk_level == "low" else 0.4), 1),
                "b2b_surplus_rebalance_kg": round(qty * (0.2 if risk_level == "low" else 0.6), 1),
            },
        }
