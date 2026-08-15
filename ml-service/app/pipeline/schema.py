"""
Layer 1 & 2: Data Collection and Ingestion Schema
Standardized payload structures for multi-persona inputs and IoT telemetry.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class IoTSensorData(BaseModel):
    temperature_c: float = Field(default=4.5, description="Storage/Reefer temperature in Celsius")
    humidity_pct: float = Field(default=85.0, description="Relative humidity percentage")
    ethylene_ppm: Optional[float] = Field(default=0.12, description="Ethylene gas emission level in ppm")
    co2_ppm: Optional[float] = Field(default=420.0, description="CO2 concentration in ppm")


class WeatherData(BaseModel):
    ambient_temp_c: float = Field(default=32.0, description="Ambient outside temperature in Celsius")
    rainfall_mm: float = Field(default=0.0, description="Rainfall in mm")
    humidity_ambient_pct: float = Field(default=65.0, description="Ambient air humidity percentage")


class LogisticsData(BaseModel):
    transit_duration_hours: float = Field(default=4.0, description="Estimated transit time in hours")
    vehicle_type: str = Field(default="reefer_truck", description="Vehicle type (reefer_truck, insulated_van, open_tempo)")
    cold_chain_active: bool = Field(default=True, description="Whether cold-chain refrigeration is active")
    distance_km: float = Field(default=55.0, description="Distance to destination in km")


class SupplyNodePayload(BaseModel):
    persona_role: str = Field(default="farmer", description="Role: farmer | mandi | wholesaler | retailer")
    node_id: str = Field(default="node-001", description="Identifier of the supply chain partner")
    commodity: str = Field(default="Tomato", description="Commodity name")
    variety: Optional[str] = Field(default="Hybrid Vine", description="Variety of commodity")
    quantity_kg: float = Field(default=2000.0, description="Batch quantity in kg")
    quality_grade: str = Field(default="A - Premium", description="Quality grade: A - Premium | B - Standard | C - Processing")
    harvest_date: str = Field(default="2026-08-14", description="Harvest date YYYY-MM-DD")
    storage_type: str = Field(default="cold_storage", description="Storage: cold_storage | warehouse | open_field")
    current_price_kg: float = Field(default=34.0, description="Current price per kg in INR")
    hours_in_storage: float = Field(default=12.0, description="Hours already elapsed in inventory/storage")

    # Layer 1 Data Sources
    iot_sensors: Optional[IoTSensorData] = Field(default_factory=IoTSensorData)
    weather: Optional[WeatherData] = Field(default_factory=WeatherData)
    logistics: Optional[LogisticsData] = Field(default_factory=LogisticsData)


class PipelineEvaluationResult(BaseModel):
    timestamp: str
    commodity: str
    quantity_kg: float
    persona_role: str

    # Layer 5: Predictive Intelligence
    predicted_mandi_price: float
    predicted_demand_kg: float
    forecast_confidence: float
    price_change_pct: Optional[float] = None
    price_trend: Optional[str] = None
    price_trajectory: Optional[List[Dict[str, Any]]] = None

    # Layer 6: Waste Risk Engine
    expected_waste_kg: float
    waste_percentage: float
    spoilage_probability: float
    remaining_shelf_life_hours: float
    risk_level: str  # low | medium | high | critical

    # Layer 7: Optimization Engine
    recommended_action: str
    optimal_route: List[str]
    storage_allocation: str
    market_redirection: Optional[str]
    pos_markdown_pct: Optional[float]
    recommended_price_kg: float

    # Layer 8: AI Agent Reasoning Log
    agent_reasoning: str
    tool_calls_executed: List[str]

    # Layer 9: Action Triggers Dispatched
    dispatched_actions: List[Dict[str, Any]]

    # Layer 10: Feedback & Retraining Metrics
    model_version: str
    mape_score: float
    retraining_triggered: bool
