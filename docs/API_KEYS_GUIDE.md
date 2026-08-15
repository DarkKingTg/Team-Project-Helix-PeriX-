#  Complete Guide: How to Get All Required Live API Keys for PeriX

PeriX is designed to use **real-time live market feeds, live weather telemetry, and cloud databases** with zero synthetic mock data. All required APIs have generous **100% Free Tiers** with instant registration.

---

## 1. 🇮🇳 Government of India Mandi Live Data API (`data.gov.in`)

This provides daily wholesale Mandi modal prices, min/max rates, and arrival tonnages across all APMCs in India directly from Agmarknet.

### How to get the API Key (Takes 2 minutes):
1. Go to the official Open Government Data Portal: **[https://data.gov.in/](https://data.gov.in/)**
2. Click **"Register"** in the top right corner.
3. Fill in your Name, Email, and Mobile number, then verify via the confirmation link sent to your email.
4. Log into **data.gov.in**.
5. Click on your **User Profile (top right) ➔ "My Profile" ➔ "API Key"** (or go to [https://data.gov.in/user/me/api-key](https://data.gov.in/user/me/api-key)).
6. Click **"Generate API Key"** and copy the key (a 64-character string).
7. Paste it into your environment files:

#### In `ml-service/.env`:
```env
DATA_GOV_IN_API_KEY=your_actual_64_character_key_here
AGMARKNET_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
```

#### In `backend/.env`:
```env
DATA_GOV_IN_API_KEY=your_actual_64_character_key_here
AGMARKNET_RESOURCE_ID=9ef84268-d588-465a-a308-a864a43d0070
```

---

## 2.  Live Weather API (`OpenWeatherMap`)

Used by the **10-Layer Waste Risk Engine** for real-time ambient temperature, humidity, and rainfall to compute Arrhenius/Q10 perishability decay.

### How to get the API Key (Takes 1 minute):
1. Go to **[https://home.openweathermap.org/users/sign_up](https://home.openweathermap.org/users/sign_up)**
2. Create a free account and verify your email.
3. Once logged in, go to the **"API Keys"** tab: [https://home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)
4. Copy the default API key generated for your account.
5. Paste it into:

#### In `ml-service/.env`:
```env
WEATHER_API_KEY=your_openweathermap_api_key_here
```

#### In `backend/.env`:
```env
WEATHER_API_KEY=your_openweathermap_api_key_here
```

---

## 3.  Firebase (Authentication & Cloud Firestore)

Used for farmer, mandi, wholesaler, and retailer login and cloud batch syncing. *(Note: PeriX includes instant fallback demo profiles, but connecting your real Firebase takes 2 minutes).*

### How to get your Firebase Credentials:
1. Go to **[https://console.firebase.google.com/](https://console.firebase.google.com/)**
2. Click **"Add project"** ➔ Name it `perix-app` ➔ Disable Google Analytics (optional) ➔ Click **Create Project**.
3. In the project dashboard, click the **Web icon (`</>`)** to add a web app ➔ Name it `PeriX Web`.
4. Firebase will display your `firebaseConfig` object:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "perix-app.firebaseapp.com",
     projectId: "perix-app",
     storageBucket: "perix-app.appspot.com",
     messagingSenderId: "123456789...",
     appId: "1:123456789:web:..."
   };
   ```
5. Paste these values into **`frontend/.env.local`**:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=perix-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=perix-app
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=perix-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef...
   ```
6. **Enable Authentication**:
   - In the Firebase sidebar, go to **Build ➔ Authentication** ➔ Click **"Get started"**.
   - Under the **"Sign-in method"** tab, enable **Email/Password** and **Anonymous**.
7. **Enable Firestore**:
   - In the Firebase sidebar, go to **Build ➔ Firestore Database** ➔ Click **"Create database"**.
   - Choose a location (e.g. `asia-south1 (Mumbai)`) ➔ Select **Start in test mode** ➔ Click **Enable**.
8. **(Optional) Backend Admin SDK Credentials**:
   - Go to **Project Settings (gear icon) ➔ Service accounts ➔ Firebase Admin SDK**.
   - Click **"Generate new private key"** ➔ Download the JSON file.
   - Copy `client_email` and `private_key` into `backend/.env`:
     ```env
     FIREBASE_PROJECT_ID=perix-app
     FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@perix-app.iam.gserviceaccount.com
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n-----END PRIVATE KEY-----\n"
     ```

---

## 4. 📧 Real OTP Email Verification (Gmail SMTP / Nodemailer)

PeriX uses **real OTP email verification** when users create an account. A 6-digit numeric verification code is sent directly to the user's Gmail/email address.

### How to set up Gmail App Password (Takes 1 minute):
1. Go to your Google Account Security settings: **[https://myaccount.google.com/security](https://myaccount.google.com/security)**
2. Make sure **2-Step Verification** is turned ON.
3. Search for **"App passwords"** in the top search bar (or go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
4. Create a new App Name (e.g. `PeriX App`) and click **Create**.
5. Google will generate a **16-character password** (e.g. `abcd efgh ijkl mnop`).
6. Copy this 16-character password into **`backend/.env`**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=abcdefghijklmnop
   SMTP_FROM="PeriX Platform" <no-reply@perix.in>
   ```

*(You can also use any other SMTP service like SendGrid, Resend, Amazon SES, or Mailgun by providing your custom `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS`.)*

---

## 5. 🧪 Verification: How to Test Live API Ingestion & Real OTP

After pasting your keys into the `.env` files:

### Test Python Live Fetcher:
Open your terminal in `ml-service` and run:
```powershell
python -m app.data.live_market_fetcher
```
It will output:
```
[*] Testing Live Agmarknet Ingestion Engine...
Status: success, Source: api.data.gov.in (Official Government of India Feed)
Fetched 5 records from live APMC Mandis...
[Weather] Live Telemetry: {'district': 'Coimbatore', 'temperature_c': 29.2, 'humidity_pct': 74.0}
```

### Test in Web Dashboard:
1. Open **[http://localhost:3000/dashboard/market](http://localhost:3000/dashboard/market)**
2. Click **"Sync Live Mandi API"** button at the top right.
3. The dashboard will instantly fetch and render the live Mandi records with the green `🟢 LIVE API (data.gov.in)` badge!
