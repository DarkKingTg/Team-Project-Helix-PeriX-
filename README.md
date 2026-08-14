#  PeriX — Autonomous Perishable Supply Mesh & Predictive Waste Intelligence
> **Transforming India's ₹1.52 Lakh Crore Food Spoilage Crisis into Recovered Revenue**

---

##  Key Project Documentation (For Judges & Evaluators)

| Document | Purpose |
|---|---|
|  **[`JUDGES_COMPREHENSIVE_DOCUMENTATION.md`](file:///c:/Users/WaveWalker/Downloads/MyStuffs/ForPro/MyWorks/hackthons%20N%20shit/PerishNetwork/JUDGES_COMPREHENSIVE_DOCUMENTATION.md)** | **Master Pitch & Technical Document**: 10-Layer Architecture, Mathematical Formulations, Q&A Defense, and 3-Minute Live Stage Demo Script. |
|  **[`PPT_DOCUMENTATION.md`](file:///c:/Users/WaveWalker/Downloads/MyStuffs/ForPro/MyWorks/hackthons%20N%20shit/PerishNetwork/PPT_DOCUMENTATION.md)** | **10-Slide Pitch Deck Guide**: Exact slide contents, visual wireframes, and word-for-word speaker notes. |
|  **[`API_KEYS_GUIDE.md`](file:///c:/Users/WaveWalker/Downloads/MyStuffs/ForPro/MyWorks/hackthons%20N%20shit/PerishNetwork/API_KEYS_GUIDE.md)** | **Live API Setup Guide**: How to get free API keys for `data.gov.in` (Agmarknet), `OpenWeatherMap`, and `Firebase`. |
|  **[`DATASET_DOCUMENTATION.md`](file:///c:/Users/WaveWalker/Downloads/MyStuffs/ForPro/MyWorks/hackthons%20N%20shit/PerishNetwork/ml-service/data/DATASET_DOCUMENTATION.md)** | **Dataset Specifications**: 37,097 official Government of India Agmarknet historical records across 16 perishables. |

---

##  Quick Start: Running the Project

### 1. Start ML Microservice (FastAPI & Models)
```powershell
cd ml-service
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Start Backend API (NestJS 11)
```powershell
cd backend
npm run start:dev
```

### 3. Start Frontend Dashboard (Next.js 16)
```powershell
cd frontend
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

##  10-Layer Enterprise Architecture
```
[Layer 1: Data Collection]  ──> Farmer Logs + IoT Sensors (Temp/C2H4) + Weather + Agmarknet + Fleet GPS
             │
[Layer 2: Data Ingestion]   ──> FastAPI + MQTT Telemetry + Async Message Streams
             │
[Layer 3: Data Storage]     ──> PostgreSQL + PostGIS (Spatial) + Redis Cache + TimescaleDB Time-Series + Firebase
             │
[Layer 4: Data Processing]  ──> Python + Pandas + NumPy Feature Engineering & Scalers
             │
[Layer 5: Predictive AI]    ──> Agmarknet XGBoost (Price/Arrivals) + Prophet Time-Series Demand Forecaster
             │
[Layer 6: Waste Risk Engine]──> Expected Waste (kg) + Waste % + Spoilage Probability + Remaining Shelf-Life (Hours)
             │
[Layer 7: Optimization]     ──> Google OR-Tools Multi-Drop Routing + Cold Storage Allocation + Dynamic Markdown
             │
[Layer 8: AI Agent Layer]   ──> LangGraph Reasoning + Multi-Step Tool Calling + Memory + Autonomous Planning
             │
[Layer 9: Action & Response]──> POS Dynamic Markdown Sync + Logistics Route Push + Cold Chain Reservation + Alerts
             │
[Layer 10: Monitoring]      ──> Actual Waste Diverted vs Predicted + MAPE Error Tracking + Retraining Feedback Loop
             │
             └────────────────► Continuous Model Retraining Loop
```

---

##  5 Stakeholder Dashboards

1. ** Farmer ([`/dashboard/crops`](http://localhost:3000/dashboard/crops))**: Crop harvest declarations, yield timing alerts, forward price curves.
2. ** Mandi Agent ([`/dashboard/inventory`](http://localhost:3000/dashboard/inventory))**: Automated margin calculations, batch intake, days-to-expiry counters.
3. ** Wholesaler ([`/dashboard/distribution`](http://localhost:3000/dashboard/distribution))**: Google OR-Tools multi-drop logistics, live cold-chain telemetry.
4. ** Retailer ([`/dashboard/pricing`](http://localhost:3000/dashboard/pricing))**: Sub-20ms POS dynamic markdown engine to clear near-expiry stock.
5. ** Admin ([`/dashboard/analytics`](http://localhost:3000/dashboard/analytics) & [`/dashboard/pipeline`](http://localhost:3000/dashboard/pipeline))**: Dual-KPI Waste Diverted (kg) vs. Revenue Recovered (₹) and 10-layer AI pipeline visualizer.
