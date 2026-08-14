"""
FastAPI Router for PeriX AI Smart Advisor & Copilot Chat.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from app.pipeline.advisor import PeriXSmartAdvisor, AdvisoryQuery

router = APIRouter(prefix="/advisor", tags=["Smart AI Advisory"])
advisor = PeriXSmartAdvisor()


class ChatQuery(BaseModel):
    message: str = Field(..., description="User message")
    language: str = Field(default="en", description="Language code (en, hi, ta, te, kn, mr, bn, gu)")
    persona_role: str = Field(default="farmer", description="Persona role")


@router.post("/tips")
async def get_smart_advisory_tips(query: AdvisoryQuery):
    """
    Returns 360-degree persona-specific advice analyzing:
    - Agmarknet XGBoost price predictions
    - 7-day weather forecasts
    - Indian festival demand catalysts (Pongal, Diwali, Navratri)
    - Inter-mandi price arbitrage opportunities
    """
    return advisor.generate_advisory(query)


@router.post("/chat")
async def chat_with_ai_copilot(query: ChatQuery):
    """
    AI Copilot chat assistant answering agricultural supply chain questions
    in 9 Indian languages.
    """
    reply = advisor.chat_response(query.message, query.language)
    return {
        "reply": reply,
        "language": query.language,
        "persona_role": query.persona_role,
    }
