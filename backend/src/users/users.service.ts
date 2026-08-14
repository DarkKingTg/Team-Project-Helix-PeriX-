import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private firebaseService: FirebaseService) {}

  async findAll() {
    const snapshot = await this.firebaseService.collection('users').get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(uid: string) {
    const doc = await this.firebaseService.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async findByRole(role: string) {
    const snapshot = await this.firebaseService
      .collection('users')
      .where('role', '==', role)
      .get();
    return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
  }

  async update(uid: string, data: Partial<Record<string, unknown>>) {
    await this.firebaseService.collection('users').doc(uid).update(data);
    return this.findOne(uid);
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
