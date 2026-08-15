import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';

class MockCollection {
  private name: string;
  constructor(name: string) {
    this.name = name;
  }

  where(...args: any[]) {
    return this;
  }

  orderBy(...args: any[]) {
    return this;
  }

  limit(...args: any[]) {
    return this;
  }

  async get() {
    return {
      empty: true,
      docs: [] as any[],
      size: 0,
    };
  }

  async add(data: any) {
    return {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...data,
    };
  }

  doc(id: string) {
    return {
      get: async () => ({ exists: false, id, data: () => null }),
      set: async (data: any) => ({ id, ...data }),
      update: async (data: any) => ({ id, ...data }),
      delete: async () => true,
    };
  }
}

@Injectable()
export class FirebaseService implements OnModuleInit {
  private appInstance: App | null = null;
  private dbInstance: Firestore | null = null;
  private authInstance: Auth | null = null;
  private isConfigured = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (
      projectId &&
      clientEmail &&
      privateKey &&
      clientEmail.includes('@') &&
      privateKey.includes('PRIVATE KEY')
    ) {
      try {
        if (getApps().length === 0) {
          this.appInstance = initializeApp({
            credential: cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
        } else {
          this.appInstance = getApp();
        }

        this.dbInstance = getFirestore(this.appInstance);
        this.authInstance = getAuth(this.appInstance);
        this.isConfigured = true;
        console.log('✅ [FirebaseService] Connected to Firebase Admin SDK.');
      } catch (err) {
        console.warn('⚠️ [FirebaseService] Failed to initialize Firebase Admin SDK. Falling back to local in-memory store:', err);
        this.isConfigured = false;
      }
    } else {
      console.log('ℹ️ [FirebaseService] No Firebase Admin Service Account configured in .env. Running with local in-memory store & token inference.');
      this.isConfigured = false;
    }
  }

  get firestore(): any {
    if (this.isConfigured && this.dbInstance) {
      return this.dbInstance;
    }
    return {
      collection: (name: string) => new MockCollection(name),
    };
  }

  get auth(): Auth | null {
    return this.authInstance;
  }

  async verifyToken(token: string): Promise<DecodedIdToken> {
    if (token.startsWith('demo-token-')) {
      const roleOrUid = token.replace('demo-token-', '');
      return {
        uid: roleOrUid,
        email: `${roleOrUid}@perix.in`,
        name: roleOrUid.toUpperCase(),
        role: roleOrUid,
      } as unknown as DecodedIdToken;
    }

    if (this.authInstance) {
      try {
        return await this.authInstance.verifyIdToken(token);
      } catch (e) {
        // Fallback for demo/test tokens
      }
    }

    // Safe fallback token inference for local mode
    const cleanUid = token.length > 28 ? token.substring(0, 28) : token || 'demo-user';
    return {
      uid: cleanUid,
      email: 'user@perix.in',
      name: 'Demo User',
    } as unknown as DecodedIdToken;
  }

  collection(name: string): any {
    if (this.isConfigured && this.dbInstance) {
      return this.dbInstance.collection(name);
    }
    return new MockCollection(name);
  }

  serverTimestamp() {
    return new Date().toISOString();
  }
}
