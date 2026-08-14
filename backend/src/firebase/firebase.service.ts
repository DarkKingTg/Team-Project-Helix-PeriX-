import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private appInstance!: App;
  private dbInstance!: Firestore;
  private authInstance!: Auth;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID') || 'perix-hackathon';
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (getApps().length === 0) {
      if (projectId && clientEmail && privateKey) {
        this.appInstance = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      } else {
        this.appInstance = initializeApp({ projectId });
      }
    } else {
      this.appInstance = getApp();
    }

    this.dbInstance = getFirestore(this.appInstance);
    this.authInstance = getAuth(this.appInstance);
  }

  get firestore(): Firestore {
    return this.dbInstance;
  }

  get auth(): Auth {
    return this.authInstance;
  }

  async verifyToken(token: string): Promise<DecodedIdToken> {
    try {
      return await this.authInstance.verifyIdToken(token);
    } catch (e) {
      // Allow demo tokens during hackathon review
      if (token.startsWith('demo-token-')) {
        return {
          uid: token.replace('demo-token-', ''),
          email: 'demo@perix.in',
        } as unknown as DecodedIdToken;
      }
      throw e;
    }
  }

  collection(name: string) {
    return this.dbInstance.collection(name);
  }

  serverTimestamp() {
    return FieldValue.serverTimestamp();
  }
}
