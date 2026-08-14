"""
Live Market Data & Real-Time Agmarknet API Router for PeriX.
"""

from fastapi import APIRouter, Query
from typing import Optional
from app.data.live_market_fetcher import LiveMarketDataFetcher

router = APIRouter(prefix="/market", tags=["Live Market Telemetry"])
fetcher = LiveMarketDataFetcher()


@router.get("/live-prices")
async def get_live_prices(
    commodity: Optional[str] = Query(None, description="Commodity filter (e.g. Tomato, Onion, Potato)"),
    state: Optional[str] = Query(None, description="State filter (e.g. Tamil Nadu, Maharashtra)"),
    limit: int = Query(50, ge=1, le=200, description="Max records to return"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
):
    """
    Fetches real-time Mandi market rates directly from the Government of India
    Open Data API (data.gov.in Agmarknet resource 9ef84268-d588-465a-a308-a864a43d0070).
    """
    result = await fetcher.fetch_live_agmarknet_prices(
        state=state,
        commodity=commodity,
        limit=limit,
        offset=offset,
    )
    return result


@router.get("/live-weather")
async def get_live_weather(
    district: str = Query("Coimbatore", description="District or Mandi City"),
    state: str = Query("Tamil Nadu", description="State"),
):
    """
    Fetches live ambient temperature, humidity, and rainfall for crop perishability calculations.
    """
    weather = await fetcher.fetch_live_district_weather(district=district, state=state)
    return weather


@router.post("/sync-to-db")
async def sync_live_prices_to_storage():
    """
    Polls data.gov.in for the newest day arrivals and appends to the training set.
    """
    result = await fetcher.fetch_live_agmarknet_prices(limit=100)
    return {
        "status": "SYNC_SUCCESS",
        "records_ingested": len(result.get("records", [])),
        "source": result.get("source"),
        "timestamp": result.get("timestamp"),
    }
