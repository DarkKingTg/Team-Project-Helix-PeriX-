import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class PredictionsService {
  private mlServiceUrl: string;

  constructor(
    private configService: ConfigService,
    private firebaseService: FirebaseService,
  ) {
    this.mlServiceUrl =
      this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
  }

  async getDemandForecast(commodity: string, state: string, days: number = 30) {
    try {
      const response = await fetch(
        `${this.mlServiceUrl}/api/forecast/demand`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commodity, state, days }),
        },
      );

      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('ML service error:', error);
      return this.getFallbackPredictions(commodity, state);
    }
  }

  async getPricePrediction(commodity: string, state: string) {
    try {
      const response = await fetch(
        `${this.mlServiceUrl}/api/pricing/predict`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commodity, state }),
        },
      );

      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('ML service error:', error);
      return this.getFallbackPricing(commodity);
    }
  }

  async getDynamicPricing(
    commodity: string,
    currentPrice: number,
    hoursToExpiry: number = 24,
    quantity: number = 100,
    temperatureC: number = 25,
    humidityPct: number = 65,
  ) {
    try {
      const response = await fetch(
        `${this.mlServiceUrl}/api/pricing/dynamic`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            commodity,
            current_price: currentPrice,
            hours_to_expiry: hoursToExpiry,
            temperature_c: temperatureC,
            humidity_pct: humidityPct,
            quantity,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`ML service returned ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('ML service error:', error);
      const discount = Math.min(
        70,
        Math.max(5, (1 - hoursToExpiry / 168) * 60),
      );
      return {
        commodity,
        original_price: currentPrice,
        recommended_price: Number((currentPrice * (1 - discount / 100)).toFixed(2)),
        discount_percentage: Number(discount.toFixed(1)),
        urgency: hoursToExpiry <= 24 ? 'critical' : hoursToExpiry <= 48 ? 'high' : 'moderate',
        reasoning: `Decay calculation based on ${hoursToExpiry}h shelf life at ${temperatureC}°C.`,
        hours_to_expiry: hoursToExpiry,
        temperature_c: temperatureC,
      };
    }
  }

  // Stored predictions from Firestore
  async getStoredPredictions(commodity?: string) {
    try {
      let q: any = this.firebaseService.collection('predictions');
      if (commodity) {
        q = q.where('commodity', '==', commodity);
      }
      const snapshot = await q.orderBy('generatedAt', 'desc').limit(20).get();
      if (snapshot && snapshot.docs) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.warn('Firestore getStoredPredictions fallback:', e);
    }
    return [];
  }

  private async getFallbackPredictions(commodity: string, state: string) {
    const baseQuantity = Math.floor(Math.random() * 5000) + 2000;
    const predictions = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      predictions.push({
        date: date.toISOString().split('T')[0],
        predicted_demand: baseQuantity + Math.floor(Math.random() * 1000 - 500),
        confidence: 70 + Math.floor(Math.random() * 20),
      });
    }
    return {
      commodity,
      state,
      predictions,
      model: 'fallback',
      note: 'ML service unavailable, showing estimated predictions',
    };
  }

  private getFallbackPricing(commodity: string) {
    const basePrices: Record<string, number> = {
      Tomato: 35,
      Potato: 25,
      Onion: 30,
      Wheat: 28,
      Rice: 42,
      default: 30,
    };
    const basePrice = basePrices[commodity] || basePrices.default;
    return {
      commodity,
      current_price: basePrice,
      predicted_price: basePrice * (1 + (Math.random() * 0.2 - 0.1)),
      trend: Math.random() > 0.5 ? 'up' : 'down',
      model: 'fallback',
    };
  }
}
