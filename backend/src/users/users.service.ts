import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  private inMemoryUsers: Map<string, Record<string, unknown>> = new Map();

  constructor(private firebaseService: FirebaseService) {
    this.seedDemoUsers();
  }

  private seedDemoUsers() {
    const demo = [
      {
        id: 'demo-farmer-01',
        uid: 'demo-farmer-01',
        email: 'farmer@perix.in',
        displayName: 'Ramesh Kumar',
        role: 'farmer',
        location: 'Coimbatore, Tamil Nadu',
      },
      {
        id: 'demo-mandi-01',
        uid: 'demo-mandi-01',
        email: 'mandi@perix.in',
        displayName: 'Coimbatore APMC Market Hub',
        role: 'mandi',
        location: 'Coimbatore, Tamil Nadu',
      },
      {
        id: 'demo-wholesaler-01',
        uid: 'demo-wholesaler-01',
        email: 'wholesaler@perix.in',
        displayName: 'AgroTransit Reefer Logistics',
        role: 'wholesaler',
        location: 'Tiruppur, Tamil Nadu',
      },
      {
        id: 'demo-retailer-01',
        uid: 'demo-retailer-01',
        email: 'retailer@perix.in',
        displayName: 'FreshMart Supermarkets',
        role: 'retailer',
        location: 'Chennai, Tamil Nadu',
      },
      {
        id: 'demo-admin-01',
        uid: 'demo-admin-01',
        email: 'admin@perix.in',
        displayName: 'PeriX Network Administrator',
        role: 'admin',
        location: 'Headquarters',
      },
    ];
    demo.forEach((u) => this.inMemoryUsers.set(u.uid, u));
  }

  async findAll() {
    try {
      const snapshot = await this.firebaseService.collection('users').get();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.warn('Firestore users.findAll fallback to memory:', e);
    }
    return Array.from(this.inMemoryUsers.values());
  }

  async findOne(uid: string) {
    try {
      const doc = await this.firebaseService.collection('users').doc(uid).get();
      if (doc && doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
    } catch (e) {
      console.warn('Firestore users.findOne fallback to memory:', e);
    }
    return this.inMemoryUsers.get(uid) || null;
  }

  async findByRole(role: string) {
    try {
      const snapshot = await this.firebaseService
        .collection('users')
        .where('role', '==', role)
        .get();
      if (snapshot && !snapshot.empty) {
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      }
    } catch (e) {
      console.warn('Firestore users.findByRole fallback to memory:', e);
    }
    return Array.from(this.inMemoryUsers.values()).filter((u) => u.role === role);
  }

  async update(uid: string, data: Partial<Record<string, unknown>>) {
    const existing = this.inMemoryUsers.get(uid) || {};
    const updated = { ...existing, ...data, id: uid, uid };
    this.inMemoryUsers.set(uid, updated);

    try {
      await this.firebaseService.collection('users').doc(uid).update(data);
    } catch (e) {
      console.warn('Firestore users.update fallback to memory:', e);
    }
    return updated;
  }

  async getStats() {
    const users = await this.findAll();
    const roles = users.reduce(
      (acc: Record<string, number>, user: Record<string, unknown>) => {
        const role = (user.role as string) || 'unknown';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    return { total: users.length, byRole: roles };
  }
}
