from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from app.routers import forecast, pricing, health, pipeline, market, advisor

app = FastAPI(
    title="PeriX",
    description="10-Layer AI Supply Chain & Predictive Waste Optimization Microservice",
    version="2.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(forecast.router, prefix="/api/forecast", tags=["Demand Forecasting"])
app.include_router(pricing.router, prefix="/api/pricing", tags=["Pricing"])
app.include_router(pipeline.router, prefix="/api", tags=["10-Layer AI Pipeline"])
app.include_router(market.router, prefix="/api", tags=["Live Market Telemetry"])
app.include_router(advisor.router, prefix="/api", tags=["Smart AI Advisory"])


@app.get("/")
async def root():
    return {
        "service": "PeriX 10-Layer AI Pipeline",
        "status": "running",
        "version": "2.0.0",
        "layers": [
            "1. Data Collection",
            "2. Data Ingestion (FastAPI + MQTT)",
            "3. Data Storage (Postgres/Redis/S3)",
            "4. Data Processing (Pandas/NumPy)",
            "5. Predictive Intelligence (XGBoost/Prophet)",
            "6. Waste Risk Engine (Shelf-life & Spoilage)",
            "7. Preventive Optimization Engine (OR-Tools)",
            "8. AI Agent Layer (LangGraph Reasoning)",
            "9. Action & Response Layer",
            "10. Monitoring & Feedback Layer (MLflow)",
        ],
    }
