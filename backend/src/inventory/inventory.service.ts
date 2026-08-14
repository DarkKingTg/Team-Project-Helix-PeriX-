import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class InventoryService {
  private mandiStore: Map<string, Record<string, unknown>> = new Map();
  private wholesalerStore: Map<string, Record<string, unknown>> = new Map();

  constructor(private firebaseService: FirebaseService) {
    this.seedDemoData();
  }

  private seedDemoData() {
    const demoMandi = [
      {
        id: 'mandi-item-1',
        mandiUserId: 'demo-user-mandi',
        commodity: 'Tomato',
        variety: 'Hybrid',
        quantityKg: 3500,
        arrivalDate: '2026-08-14',
        modalPricePerKg: 34.0,
        storageType: 'ambient_shed',
        spoilageRisk: 'medium',
        hoursInStorage: 18,
      },
      {
        id: 'mandi-item-2',
        mandiUserId: 'demo-user-mandi',
        commodity: 'Onion',
        variety: 'Red Nasik',
        quantityKg: 6200,
        arrivalDate: '2026-08-13',
        modalPricePerKg: 31.0,
        storageType: 'ventilated_warehouse',
        spoilageRisk: 'low',
        hoursInStorage: 28,
      },
    ];

    const demoWholesale = [
      {
        id: 'ws-item-1',
        wholesalerId: 'demo-user-wholesaler',
        commodity: 'Potato',
        variety: 'Jyoti',
        quantityKg: 8000,
        storageType: 'cold_storage',
        temperatureC: 4.2,
        spoilageRisk: 'low',
        hoursInStorage: 48,
        destinationCity: 'Chennai',
      },
    ];

    demoMandi.forEach((m) => this.mandiStore.set(m.id, m));
    demoWholesale.forEach((w) => this.wholesalerStore.set(w.id, w));
  }

  // Mandi inventory
  async getMandiInventory(mandiUserId: string) {
    try {
      const snapshot = await this.firebaseService
        .collection('mandi_inventory')
        .where('mandiUserId', '==', mandiUserId)
        .get();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.warn('Firestore getMandiInventory fallback to memory:', e);
    }
    return Array.from(this.mandiStore.values()).filter(
      (m) => m.mandiUserId === mandiUserId || mandiUserId.includes('mandi') || mandiUserId === 'user001',
    );
  }

  async addMandiInventory(data: Record<string, unknown>) {
    const id = `mandi-${Date.now()}`;
    const newItem = { id, ...data, updatedAt: new Date().toISOString() };
    this.mandiStore.set(id, newItem);

    try {
      const docRef = await this.firebaseService.collection('mandi_inventory').add({
        ...data,
        updatedAt: this.firebaseService.serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (e) {
      console.warn('Firestore addMandiInventory fallback to memory:', e);
      return newItem;
    }
  }

  // Wholesaler inventory
  async getWholesalerInventory(wholesalerId: string) {
    try {
      const snapshot = await this.firebaseService
        .collection('wholesaler_inventory')
        .where('wholesalerId', '==', wholesalerId)
        .get();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.warn('Firestore getWholesalerInventory fallback to memory:', e);
    }
    return Array.from(this.wholesalerStore.values()).filter(
      (w) => w.wholesalerId === wholesalerId || wholesalerId.includes('wholesaler') || wholesalerId === 'user001',
    );
  }

  async addWholesalerInventory(data: Record<string, unknown>) {
    const id = `ws-${Date.now()}`;
    const newItem = { id, ...data, updatedAt: new Date().toISOString() };
    this.wholesalerStore.set(id, newItem);

    try {
      const docRef = await this.firebaseService.collection('wholesaler_inventory').add({
        ...data,
        updatedAt: this.firebaseService.serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (e) {
      console.warn('Firestore addWholesalerInventory fallback to memory:', e);
      return newItem;
    }
  }

  // Generic operations
  async updateInventoryItem(collection: string, id: string, data: Record<string, unknown>) {
    if (collection === 'mandi_inventory') {
      const prev = this.mandiStore.get(id) || {};
      this.mandiStore.set(id, { ...prev, ...data, id });
    } else {
      const prev = this.wholesalerStore.get(id) || {};
      this.wholesalerStore.set(id, { ...prev, ...data, id });
    }

    try {
      await this.firebaseService.collection(collection).doc(id).update({
        ...data,
        updatedAt: this.firebaseService.serverTimestamp(),
      });
      const doc = await this.firebaseService.collection(collection).doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (e) {
      console.warn('Firestore updateInventoryItem fallback to memory:', e);
      return { id, ...data };
    }
  }

  async deleteInventoryItem(collection: string, id: string) {
    if (collection === 'mandi_inventory') {
      this.mandiStore.delete(id);
    } else {
      this.wholesalerStore.delete(id);
    }

    try {
      await this.firebaseService.collection(collection).doc(id).delete();
    } catch (e) {
      console.warn('Firestore deleteInventoryItem fallback to memory:', e);
    }
    return { deleted: true, id };
  }

  // Aggregated stats
  async getAllInventoryStats() {
    return {
      mandi: {
        total: this.mandiStore.size,
        items: Array.from(this.mandiStore.values()),
      },
      wholesaler: {
        total: this.wholesalerStore.size,
        items: Array.from(this.wholesalerStore.values()),
      },
    };
  }
}
