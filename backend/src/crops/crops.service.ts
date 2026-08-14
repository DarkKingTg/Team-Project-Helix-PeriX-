import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class CropsService {
  constructor(private firebaseService: FirebaseService) {}

  async findByFarmer(farmerId: string) {
    const snapshot = await this.firebaseService
      .collection('crops')
      .where('farmerId', '==', farmerId)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async findAll() {
    const snapshot = await this.firebaseService.collection('crops').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async findAvailable() {
    const snapshot = await this.firebaseService
      .collection('crops')
      .where('status', '==', 'available')
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async create(data: Record<string, unknown>) {
    const docRef = await this.firebaseService.collection('crops').add({
      ...data,
      createdAt: this.firebaseService.serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  }

  async update(id: string, data: Partial<Record<string, unknown>>) {
    await this.firebaseService.collection('crops').doc(id).update(data);
    const doc = await this.firebaseService.collection('crops').doc(id).get();
    return { id: doc.id, ...doc.data() };
  }

  async delete(id: string) {
    await this.firebaseService.collection('crops').doc(id).delete();
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
