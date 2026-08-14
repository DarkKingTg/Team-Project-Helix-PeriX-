"""
Layer 9: Action & Response Layer
Translates AI agent tool decisions into operational triggers across physical and digital nodes.
"""

from typing import Dict, Any, List
from datetime import datetime


class ActionDispatcher:
    """Dispatches webhooks, alerts, and operational commands across the supply mesh."""

    def dispatch(
        self,
        node_id: str,
        commodity: str,
        risk_data: Dict[str, Any],
        opt_data: Dict[str, Any],
        tool_calls: List[str],
    ) -> List[Dict[str, Any]]:
        actions = []
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        # 1. POS Dynamic Markdown Sync
        if opt_data.get("pos_markdown_pct", 0) > 0:
            actions.append({
                "action_type": "POS_DYNAMIC_MARKDOWN",
                "target_node": node_id,
                "commodity": commodity,
                "original_price": opt_data["recommended_price_kg"] / (1 - opt_data["pos_markdown_pct"]/100),
                "markdown_price": opt_data["recommended_price_kg"],
                "discount_pct": opt_data["pos_markdown_pct"],
                "status": "DISPATCHED_TO_POS",
                "timestamp": now_str,
            })

        # 2. Logistics & Route Change Push
        if opt_data.get("optimal_route"):
            actions.append({
                "action_type": "LOGISTICS_ROUTE_CHANGE",
                "target_fleet": "Active Reefer Fleet Dispatch",
                "route_stops": opt_data["optimal_route"],
                "status": "ROUTE_PUSHED",
                "timestamp": now_str,
            })

        # 3. Storage Temperature Calibration / Reservation
        actions.append({
            "action_type": "COLD_STORAGE_RESERVATION",
            "allocation_type": opt_data["storage_allocation"],
            "status": "ALLOCATED_ACTIVE",
            "timestamp": now_str,
        })

        # 4. Farmer / Supplier Notification Alert
        if risk_data["risk_level"] in ["critical", "high"]:
            actions.append({
                "action_type": "FARMER_URGENT_HARVEST_ALERT",
                "message": f"Optimal price window shrinking for {commodity}. Accelerated dispatch recommended.",
                "status": "PUSH_NOTIFICATION_SENT",
                "timestamp": now_str,
            })

        return actions
