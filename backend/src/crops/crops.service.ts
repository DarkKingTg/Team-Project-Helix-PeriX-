import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class CropsService {
  private inMemoryCrops: Map<string, Record<string, unknown>> = new Map();

  constructor(private firebaseService: FirebaseService) {}

  async findByFarmer(farmerId: string) {
    try {
      const snapshot = await this.firebaseService
        .collection('crops')
        .where('farmerId', '==', farmerId)
        .get();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.warn('Firestore crops.findByFarmer fallback to memory:', e);
    }
    return Array.from(this.inMemoryCrops.values()).filter(
      (c) => c.farmerId === farmerId,
    );
  }

  async findAll() {
    try {
      const snapshot = await this.firebaseService.collection('crops').get();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.warn('Firestore crops.findAll fallback to memory:', e);
    }
    return Array.from(this.inMemoryCrops.values());
  }

  async findAvailable() {
    try {
      const snapshot = await this.firebaseService
        .collection('crops')
        .where('status', '==', 'available')
        .get();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.warn('Firestore crops.findAvailable fallback to memory:', e);
    }
    return Array.from(this.inMemoryCrops.values()).filter(
      (c) => c.status === 'available',
    );
  }

  async create(data: Record<string, unknown>) {
    const id = `crop-${Date.now()}`;
    const newCrop = { id, ...data, createdAt: new Date().toISOString() };
    this.inMemoryCrops.set(id, newCrop);

    try {
      const docRef = await this.firebaseService.collection('crops').add({
        ...data,
        createdAt: this.firebaseService.serverTimestamp(),
      });
      return { id: docRef.id, ...data };
    } catch (e) {
      console.warn('Firestore crops.create fallback to memory:', e);
      return newCrop;
    }
  }

  async update(id: string, data: Partial<Record<string, unknown>>) {
    const existing = this.inMemoryCrops.get(id) || {};
    const updated = { ...existing, ...data, id };
    this.inMemoryCrops.set(id, updated);

    try {
      await this.firebaseService.collection('crops').doc(id).update(data);
      const doc = await this.firebaseService.collection('crops').doc(id).get();
      return { id: doc.id, ...doc.data() };
    } catch (e) {
      console.warn('Firestore crops.update fallback to memory:', e);
      return updated;
    }
  }

  async delete(id: string) {
    this.inMemoryCrops.delete(id);
    try {
      await this.firebaseService.collection('crops').doc(id).delete();
    } catch (e) {
      console.warn('Firestore crops.delete fallback to memory:', e);
    }
    return { deleted: true, id };
  }

  async getStatsByFarmer(farmerId: string) {
    const crops = await this.findByFarmer(farmerId);
    const totalQuantity = crops.reduce(
      (sum: number, c: any) => sum + (Number(c.quantity) || 0),
      0,
    );
    const statusCounts = crops.reduce((acc: Record<string, number>, c: any) => {
      const status = (c.status as string) || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCrops: crops.length,
      totalQuantity,
      byStatus: statusCounts,
    };
  }
}
