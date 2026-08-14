import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class InventoryService {
  constructor(private firebaseService: FirebaseService) {}

  // Mandi inventory
  async getMandiInventory(mandiUserId: string) {
    const snapshot = await this.firebaseService
      .collection('mandi_inventory')
      .where('mandiUserId', '==', mandiUserId)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async addMandiInventory(data: Record<string, unknown>) {
    const docRef = await this.firebaseService.collection('mandi_inventory').add({
      ...data,
      updatedAt: this.firebaseService.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  }

  // Wholesaler inventory
  async getWholesalerInventory(wholesalerId: string) {
    const snapshot = await this.firebaseService
      .collection('wholesaler_inventory')
      .where('wholesalerId', '==', wholesalerId)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async addWholesalerInventory(data: Record<string, unknown>) {
    const docRef = await this.firebaseService.collection('wholesaler_inventory').add({
      ...data,
      updatedAt: this.firebaseService.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  }

  // Generic operations
  async updateInventoryItem(collection: string, id: string, data: Record<string, unknown>) {
    await this.firebaseService.collection(collection).doc(id).update({
      ...data,
      updatedAt: this.firebaseService.serverTimestamp(),
    });
    const doc = await this.firebaseService.collection(collection).doc(id).get();
    return { id: doc.id, ...doc.data() };
  }

  async deleteInventoryItem(collection: string, id: string) {
    await this.firebaseService.collection(collection).doc(id).delete();
    return { deleted: true, id };
  }

  // Aggregated stats
  async getAllInventoryStats() {
    const [mandiSnap, wholesalerSnap] = await Promise.all([
      this.firebaseService.collection('mandi_inventory').get(),
      this.firebaseService.collection('wholesaler_inventory').get(),
    ]);

    return {
      mandi: {
        total: mandiSnap.size,
        items: mandiSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
      },
      wholesaler: {
        total: wholesalerSnap.size,
        items: wholesalerSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })),
      },
    };
  }
}
