import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class InventoryService {
  private mandiStore: Map<string, Record<string, unknown>> = new Map();
  private wholesalerStore: Map<string, Record<string, unknown>> = new Map();

  constructor(private firebaseService: FirebaseService) {}

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
      (m) => m.mandiUserId === mandiUserId,
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
      (w) => w.wholesalerId === wholesalerId,
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
