# PeriX: Autonomous Perishable Supply Mesh and Predictive Waste Intelligence
Transforming India's Post-Harvest Food Spoilage Crisis into Recovered Revenue

---

## Production Deployments

| Service Component | Hosting Platform | Production URL | Health Status Endpoint |
|---|---|---|---|
| Web Application (Frontend) | Vercel | [team-project-helix-perix.vercel.app](https://team-project-helix-peri-x-lovat.vercel.app/) | Production Active (Next.js 16) |
| Backend API Microservice | Render | [team-project-helix-perix.onrender.com](https://team-project-helix-perix.onrender.com) | [/health](https://team-project-helix-perix.onrender.com/health) |
| 10-Layer AI ML Microservice | Render | [team-project-helix-perix-2.onrender.com](https://team-project-helix-perix-2.onrender.com) | [/api/health](https://team-project-helix-perix-2.onrender.com/api/health) |

---

## Key Project Documentation

| Document | Description |
|---|---|
| [JUDGES_COMPREHENSIVE_DOCUMENTATION.md](file:///c:/Users/WaveWalker/Downloads/MyStuffs/ForPro/MyWorks/hackthons%20N%20shit/PerishNetwork/JUDGES_COMPREHENSIVE_DOCUMENTATION.md) | Comprehensive Pitch and Technical Dossier: 10-Layer Architecture, Mathematical Formulations, Q&A Defense, and 3-Minute Live Stage Demo Script. |
| [PPT_DOCUMENTATION.md](file:///c:/Users/WaveWalker/Downloads/MyStuffs/ForPro/MyWorks/hackthons%20N%20shit/PerishNetwork/PPT_DOCUMENTATION.md) | 10-Slide Pitch Deck Specification: Slide structure, wireframes, and speaker delivery scripts. |
| [API_KEYS_GUIDE.md](file:///c:/Users/WaveWalker/Downloads/MyStuffs/ForPro/MyWorks/hackthons%20N%20shit/PerishNetwork/API_KEYS_GUIDE.md) | Live API Configuration Guide: Setup instructions for data.gov.in (Agmarknet), OpenWeatherMap, and Firebase. |
| [DATASET_DOCUMENTATION.md](file:///c:/Users/WaveWalker/Downloads/MyStuffs/ForPro/MyWorks/hackthons%20N%20shit/PerishNetwork/ml-service/data/DATASET_DOCUMENTATION.md) | Dataset Specifications: 37,097 verified Government of India Agmarknet historical records covering 16 perishable commodities. |

---

## Executive Summary and Problem Statement

India is the second-largest producer of fruits and vegetables globally, harvesting over 330 million metric tonnes annually. However, the nation suffers from an acute post-harvest supply chain bottleneck:
- Annual Economic Loss: Over INR 1.52 Lakh Crore (approximately USD 18 Billion) worth of agricultural produce is wasted annually before reaching consumers.
- Spoilage Rates: Highly perishable commodities (tomatoes, onions, bananas, green chillies) experience spoilage rates between 18% and 40% across transit and storage.
- Structural Inefficiencies: Fragmented intermediaries, lack of real-time cold-chain visibility, static pricing mechanisms, and information asymmetry between farm gates, wholesale mandis, and retail points.

PeriX resolves this systemic failure through a decentralized supply mesh that continuously predicts spoilage risks, optimizes logistics rebalancing, dynamically adjusts retail pricing, and guarantees transparent settlement through smart escrow workflows.

---

## Why PeriX is Unique: Core Differentiators

### 1. Dynamic Arrhenius Shelf-Life Modeling
Traditional supply chains rely on static calendar expiration dates. PeriX implements temperature-dependent Arrhenius reaction kinetics to calculate true biological decay in real time based on ambient temperature and relative humidity telemetry:
$$\text{Shelf Life Remaining (Hours)} = \text{Base Shelf Life} \times \exp\left(-\frac{E_a}{R} \left(\frac{1}{T_{\text{ambient}}} - \frac{1}{T_{\text{baseline}}}\right)\right)$$

### 2. Closed-Loop 10-Layer Autonomous AI Engine
Rather than presenting static visual charts, PeriX automates decision-making across 10 interconnected operational layers:
Data Collection -> Ingestion -> Storage -> Processing -> Predictive AI -> Waste Risk Engine -> Optimization -> AI Agent Reasoning -> Automated Action Dispatch -> Continuous Feedback Monitoring.

### 3. Preventive Rebalancing and Fleet Optimization
When an in-transit consignment or warehouse lot exhibits elevated spoilage risk, the system utilizes Google OR-Tools (Vehicle Routing Problem with Time Windows - VRPTW) to compute alternate routes, redirecting produce to the nearest cold storage facility or industrial processing hub before total loss occurs.

### 4. Sub-20ms POS Dynamic Markdown Algorithm
At the retail edge, static price tags cause near-expiry produce to be discarded into landfills. PeriX provides an algorithmic markdown formula that automatically discounts products proportionally to remaining shelf life hours, incentivizing immediate clearance while preserving retailer margins.

### 5. Multi-Persona End-to-End Coordination
PeriX unifies four distinct supply chain roles into a single synchronized state:
- Farmer: Yield logging, warehouse slot booking, guaranteed escrow payouts.
- Mandi Operator: Quality grading intake, cold storage space allocation, batch tracking.
- Wholesaler: Inter-district reefer logistics, surplus marketplace trading.
- Retailer: POS markdown execution, rapid stock turnaround, inventory health monitoring.
- Super Admin: Master Network Operations Center (NOC) with cross-tier visibility and live telemetry.

---

## Implementation Feasibility: How This is Doable

PeriX is engineered for immediate real-world deployment through practical, production-ready design decisions:

1. Data Grounding on Government Standards:
   The machine learning models are trained on 37,097 official Government of India Agmarknet records and integrate directly with live API endpoints on `data.gov.in` for daily market arrivals and modal prices.

2. Lightweight Microservices Architecture:
   - Frontend: Next.js 16 with Server-Side Rendering and Tailwind CSS, deployed on Vercel for sub-second global response times.
   - Backend API: NestJS 11 enterprise architecture running on Node.js with strict TypeScript validation.
   - Machine Learning Microservice: FastAPI running Python 3.11 with pre-trained XGBoost and Prophet models, executing inference in under 50 milliseconds.
   - Real-Time Data Layer: Firebase Firestore with dual offline-first persistence for unreliable rural network environments.

3. Hardware-Agnostic Telemetry:
   Ingests standard temperature and humidity data over MQTT and HTTPS REST without requiring proprietary hardware.

4. Vernacular Accessibility for Indian Field Conditions:
   Full localization across 8 Indian languages (English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Bengali) ensuring zero barrier to adoption for rural farmers and mandi workers.

---

## End-to-End Operational Workflow

The PeriX system coordinates five distinct operational phases to ensure zero perishable wastage:

```
[Phase 1: Farmer Logging] ──> Crop Declaration & Forward Price Modeling
             │
[Phase 2: Mandi Intake]   ──> Quality Grading, Cold Storage Allocation & Escrow Lock
             │
[Phase 3: Risk Telemetry] ──> Arrhenius Shelf-Life Decay Monitoring (Temp/Humidity)
             │
[Phase 4: OR-Tools Route] ──> Preventive Rebalancing & Multi-Drop Fleet Dispatch
             │
[Phase 5: POS Markdown]   ──> Retail Dynamic Pricing, Fast Clearance & Escrow Payout
```

### Phase 1: Farm Gate Logging and Harvest Prediction
1. The farmer registers standing crop batches (commodity, acreage, expected harvest date) via the Farmer Portal.
2. Prophet and XGBoost models evaluate historical Agmarknet seasonality and weather patterns to project forward price curves and market arrival volumes.
3. The platform suggests optimal harvest windows to avoid market gluts and reserves intake capacity at the nearest certified cold storage terminal.

### Phase 2: Mandi Intake, Storage Allocation, and Smart Escrow
1. Produce arrives at the Mandi Terminal where moisture, temperature, and quality grade are recorded.
2. The Mandi inventory manager accepts the consignment and allocates optimal storage (ambient shed vs. multi-chamber cold storage).
3. A smart purchase order is generated with locked escrow funds, ensuring guaranteed payment upon completion of verified distribution.

### Phase 3: Real-Time Arrhenius Decay and Waste Risk Evaluation
1. IoT environmental telemetry (ambient temperature, humidity) is streamed continuously to the ML Microservice.
2. The Arrhenius decay engine calculates hourly shelf-life reduction.
3. If temperature thresholds exceed safety limits, an automated spoilage risk alert is generated along with estimated hours to critical spoilage.

### Phase 4: Autonomous Rebalancing and Logistics Dispatch
1. The Wholesaler module identifies lots with high urgency and invokes Google OR-Tools to solve the Vehicle Routing Problem with Time Windows (VRPTW).
2. The system computes optimal multi-drop logistics paths, dispatching reefer fleets to transfer stock to high-demand urban centers or food processing units before degradation.

### Phase 5: Retailer Dynamic Markdowns and Final Settlement
1. Retail POS terminals receive produce batches with live expiration counters.
2. The dynamic markdown algorithm systematically lowers retail prices as remaining shelf life decreases, ensuring rapid sell-through to consumers.
3. Upon final sale or delivery verification, escrow funds are automatically released to farmers and warehouse operators, completing the transparent transaction loop.

---

## 10-Layer Enterprise Architecture

```
[Layer 1: Data Collection]  --> Farmer Logs, Mandi Agmarknet, Weather Telemetry, Fleet GPS
             |
[Layer 2: Data Ingestion]   --> FastAPI REST, MQTT Stream Ingestion, Schema Validators
             |
[Layer 3: Data Storage]     --> Firebase Firestore, Redis Cache, Structured JSON Datastores
             |
[Layer 4: Data Processing]  --> Pandas, NumPy Feature Engineering, Temporal Moving Averages
             |
[Layer 5: Predictive AI]    --> Agmarknet XGBoost (Price/Arrivals) + Prophet Demand Forecaster
             |
[Layer 6: Waste Risk Engine]--> Spoilage Probability, Days-to-Expiry, Arrhenius Decay Factor
             |
[Layer 7: Optimization]     --> Google OR-Tools Multi-Drop Logistics Routing & Storage Matching
             |
[Layer 8: AI Agent Layer]   --> LangGraph Agentic Reasoning with Groq Llama 3.3 70B
             |
[Layer 9: Action & Response]--> Automated Escrow Triggers, POS Markdown Sync, Route Redirection
             |
[Layer 10: Monitoring]      --> Actual Waste Diverted vs Predicted, MAPE Tracking, Retraining
             |
             +-----------------> Continuous Closed-Loop Feedback Retraining
```

---

## Stakeholder Dashboards

1. Farmer Dashboard (`/dashboard/crops`):
   Standing crop declarations, harvest window prediction, cold storage intake booking, and forward price curves.

2. Mandi Storage Terminal (`/dashboard/inventory`):
   Batch quality assessment, warehouse capacity utilization, automated storage charges, and days-to-expiry tracking.

3. Wholesaler Logistics Hub (`/dashboard/wholesaler` and `/dashboard/distribution`):
   Multi-drop reefer fleet management, inter-hub produce transfers, and surplus marketplace bidding.

4. Retailer POS Engine (`/dashboard/pricing`):
   Algorithmic dynamic markdown execution, inventory turnover rate tracking, and consumer deal syndication.

5. Super Admin Network Operations Center (`/dashboard`, `/dashboard/analytics`, `/dashboard/pipeline`):
   Network-wide waste diverted (kg) vs. revenue recovered (INR), live microservice telemetry, and node registration control.

---

## Quick Start: Running Locally

### Prerequisites
- Node.js version 20 or higher
- Python version 3.11
- Git

### 1. Start ML Microservice (FastAPI, XGBoost, Prophet)
```powershell
cd ml-service
pip install -r requirements.txt
python -m uvicorn app.main:app --port 8000 --reload
```

### 2. Start Backend API Microservice (NestJS 11)
```powershell
cd backend
npm install
npm run start:dev
```

### 3. Start Frontend Web Dashboard (Next.js 16)
```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Environment Variables Reference

### Frontend Configuration (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=https://team-project-helix-perix.onrender.com/api/v1
NEXT_PUBLIC_ML_URL=https://team-project-helix-perix-2.onrender.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=perix-4936c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=perix-4936c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=perix-4936c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=418344107087
NEXT_PUBLIC_FIREBASE_APP_ID=1:418344107087:web:d1e3335c89b1e735ebfe3a
```

### Backend Configuration (`backend/.env`)
```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://team-project-helix-perix.vercel.app
ML_SERVICE_URL=https://team-project-helix-perix-2.onrender.com
FIREBASE_PROJECT_ID=perix-4936c
DATA_GOV_IN_API_KEY=your_data_gov_in_api_key
AGMARKNET_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
```

### Machine Learning Service Configuration (`ml-service/.env`)
```env
PORT=8000
HOST=0.0.0.0
ENVIRONMENT=production
PYTHON_VERSION=3.11.9
MODEL_DIR=app/trained_models
DATA_DIR=data
AUTO_RETRAIN_INTERVAL_HOURS=24
MAPE_THRESHOLD_PCT=12.0
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DATA_GOV_IN_API_KEY=your_data_gov_in_api_key
AGMARKNET_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
WEATHER_API_KEY=your_weather_api_key_here
```
