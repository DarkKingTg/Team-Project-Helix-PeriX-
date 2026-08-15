"""
Groq Cloud AI Integration for PeriX AI Copilot.
Powered by Meta Llama 3.3 70B Versatile via Groq Ultra-Fast Inference.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("groq_copilot")

# Language code to display name mapping
LANGUAGE_NAMES = {
    "en": "English",
    "ta": "Tamil (தமிழ்)",
    "hi": "Hindi (हिन्दी)",
    "te": "Telugu (తెలుగు)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "mr": "Marathi (मराठी)",
    "bn": "Bengali (বাংলা)",
    "gu": "Gujarati (ગુજરાતી)",
}


class GroqCopilot:
    """
    Groq-powered conversational AI agent for agricultural supply chain,
    price prediction, weather advisories, cold-chain preservation, and mandi arbitrage.
    """

    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY", "").strip()
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        self._client = None

    @property
    def is_configured(self) -> bool:
        """Returns True if a valid API key is present."""
        return bool(self.api_key and self.api_key != "your_groq_api_key_here")

    def _get_client(self):
        if not self.is_configured:
            return None
        if self._client is None:
            try:
                from groq import Groq
                self._client = Groq(api_key=self.api_key)
            except Exception as err:
                logger.error(f"Failed to initialize Groq client: {err}")
                return None
        return self._client

    def build_system_prompt(
        self,
        language: str = "en",
        persona_role: str = "farmer",
        mandi_benchmarks: Optional[Dict[str, Any]] = None,
        festival_calendar: Optional[List[Dict[str, Any]]] = None,
    ) -> str:
        """Constructs an expert system prompt infused with live domain knowledge and strict role-gated boundaries."""
        lang_name = LANGUAGE_NAMES.get(language.lower(), "English")
        today_str = datetime.now().strftime("%d %B %Y")
        role_lower = persona_role.lower().strip()

        benchmarks_summary = ""
        if mandi_benchmarks:
            benchmarks_summary = f"\n### Live Mandi Benchmark Rates:\n{json.dumps(mandi_benchmarks, indent=2)}\n"

        festivals_summary = ""
        if festival_calendar:
            festivals_summary = f"\n### Upcoming Festival Demand Calendar:\n{json.dumps(festival_calendar, indent=2)}\n"

        # Construct role-specific capability and boundary instructions
        if role_lower == "farmer":
            role_instructions = """
### ACTIVE ROLE: REGISTERED FARMER (FARM-GATE ADVISORY)
- **You are exclusively advising a Farmer.**
- **Allowed Topics**:
  1. Crop harvest yields, optimal harvesting dates and times based on weather forecasts (rainfall, temperature).
  2. Live Agmarknet mandi modal rates and 7-day price momentum forecasts (Tomatoes, Onions, Potatoes, Chillies, etc.).
  3. Selecting nearby operational regional cold storage and APMC warehouses (Coimbatore, Nilgiris, Tiruppur, Chennai, Bengaluru, etc.) to deposit harvest yields.
  4. Best practices for post-harvest handling, sorting, cleaning, quality grades (Grade A, B, C), and reducing on-farm spoilage.
  5. Tracking warehouse deposit escrow orders placed by the farmer.
- **STRICT RESTRICTIONS & PRIVACY GUARDS (DO NOT VIOLATE)**:
  - DO NOT disclose internal warehouse operator inventory records or stock levels belonging to other farmers.
  - DO NOT provide internal wholesale supermarket contract margins, wholesale profit margins, or competitor wholesaler distribution routes.
  - If the farmer asks about internal warehouse ledgers or wholesale retail profits, politely respond:
    *"As your Farmer Advisor, I can only provide crop price forecasts, harvest timing, warehouse deposit guidance, and farm-gate market intelligence. Internal warehouse or wholesale retail records are restricted."*
"""
        elif role_lower in ["mandi", "warehouse"]:
            role_instructions = """
### ACTIVE ROLE: WAREHOUSE / MANDI OPERATOR (STORAGE & DISPATCH)
- **You are exclusively advising a Warehouse / Mandi Storage Operator.**
- **Allowed Topics**:
  1. Inward farmer crop intake verification, batch logging, and inventory capacity management.
  2. Quality Control (QC) inspection, grading (Grade A, B, C), and discrepancy rejection protocols (e.g. inaccurate declared weight, moisture decay, variety mismatch).
  3. Cold-storage room temperatures (2°C - 4°C for perishables, 18°C - 24°C for ventilated), humidity control (85-90%), and ethylene mitigation.
  4. Warehouse goods catalogue stock levels, available vs dispatched volumes, and storage buffer capacity.
  5. Peer warehouse rebalancing to resolve regional stock shortages or surpluses.
  6. Outbound customizable dispatching to wholesalers: setting custom dispatch quantities (kg), calculating fair wholesale selling rates (₹/kg), and reefer transport fleet coordination.
- **STRICT RESTRICTIONS & PRIVACY GUARDS (DO NOT VIOLATE)**:
  - DO NOT disclose private farmer bank/loan details, un-consigned farm gate standing crops of non-connected regions, or confidential retailer shelf profit margins.
  - If asked about confidential farmer personal finances or internal retail POS margins, politely respond:
    *"As your Warehouse Operations Copilot, I provide guidance on inward intake verification, storage temperature kinetics, goods catalogue management, and wholesaler dispatching. Private farmer financial data and retailer POS margins are restricted."*
"""
        elif role_lower == "wholesaler":
            role_instructions = """
### ACTIVE ROLE: WHOLESALER & BULK AGGREGATOR (RETAIL LOGISTICS)
- **You are exclusively advising a Wholesaler / Bulk Aggregator.**
- **Allowed Topics**:
  1. Inward consignments received and dispatched from regional cold-chain warehouses.
  2. Reefer transport telemetry, transit temperature monitoring (2°C - 4°C), and arrival scheduling.
  3. Wholesale procurement rates, wholesale acquisition costs, and target retail shelf price recommendations.
  4. Allocating bulk shipments to supermarket chains, retail grocers (FreshMart, Reliance Smart, Nilgiris), and dark store fulfillment centers.
  5. Dynamic POS markdown strategies (25-40% discount triggers for batches with < 36h shelf life) to eliminate retail food waste.
  6. Regional festival and consumer retail demand surge forecasts.
- **STRICT RESTRICTIONS & PRIVACY GUARDS (DO NOT VIOLATE)**:
  - DO NOT disclose direct farmer personal data or intake ledgers of warehouses that have not dispatched goods to this wholesaler.
  - DO NOT disclose competitor wholesale dealer private margins.
  - If asked about internal farm-gate records or other warehouses' private inventories, politely respond:
    *"As your Wholesale Distribution Copilot, I provide intelligence on received warehouse shipments, cold-chain transport, supermarket allocation, and dynamic POS retail markdowns. Non-consigned farm-gate records and other warehouses' internal intakes are restricted."*
"""
        else:
            role_instructions = """
### ACTIVE ROLE: SYSTEM ADMINISTRATOR
- You provide system-wide supply chain overview, node telemetry, escrow audit status, and cross-network throughput analytics.
"""

        return f"""You are **PeriAI Copilot** (PeriX AI Agricultural Advisor & Supply Chain Intelligence Assistant).
Today's Date: {today_str}.

{role_instructions}

{benchmarks_summary}
{festivals_summary}

### Output Instructions:
- **Language**: Respond in **{lang_name}**. If the requested language is non-English (e.g. Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati), generate high quality, natural, and accurate responses in that language's native script.
- **Tone**: Professional, encouraging, quantitative, and actionable. Use bullet points and bold highlights for prices, percentages, and temperature recommendations.
- Keep responses concise, structured, and easy to read on mobile and desktop dashboards.
"""

    def generate_chat_response(
        self,
        user_message: str,
        language: str = "en",
        persona_role: str = "farmer",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        mandi_benchmarks: Optional[Dict[str, Any]] = None,
        festival_calendar: Optional[List[Dict[str, Any]]] = None,
    ) -> Optional[str]:
        """
        Calls Groq API to generate an intelligent LLM response.
        Returns None on any error or if unconfigured (allowing fallback).
        """
        client = self._get_client()
        if not client:
            return None

        system_prompt = self.build_system_prompt(
            language=language,
            persona_role=persona_role,
            mandi_benchmarks=mandi_benchmarks,
            festival_calendar=festival_calendar,
        )

        messages = [{"role": "system", "content": system_prompt}]

        # Append previous conversation history if provided (limit to last 6 turns)
        if conversation_history:
            for turn in conversation_history[-6:]:
                role = "assistant" if turn.get("sender") == "ai" or turn.get("role") in ["assistant", "ai"] else "user"
                content = turn.get("text") or turn.get("content") or ""
                if content.strip():
                    messages.append({"role": role, "content": content})

        # Append current user message
        messages.append({"role": "user", "content": user_message})

        try:
            chat_completion = client.chat.completions.create(
                messages=messages,
                model=self.model,
                temperature=0.6,
                max_tokens=600,
                top_p=0.9,
            )
            response_text = chat_completion.choices[0].message.content
            if response_text and response_text.strip():
                return response_text.strip()
        except Exception as err:
            logger.warning(f"Groq API call failed, falling back to rule-based engine: {err}")
            return None

        return None
