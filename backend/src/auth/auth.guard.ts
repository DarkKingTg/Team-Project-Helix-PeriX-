import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private firebaseService: FirebaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await this.firebaseService.verifyToken(token);
      request.user = decodedToken;

      try {
        const userDoc = await this.firebaseService
          .collection('users')
          .doc(decodedToken.uid)
          .get();

        if (userDoc && userDoc.exists) {
          request.userProfile = userDoc.data();
        } else {
          // Infer role from email or token uid
          const tokenStr = (decodedToken.email || decodedToken.uid || '').toLowerCase();
          const inferredRole = tokenStr.includes('mandi')
            ? 'mandi'
            : tokenStr.includes('wholesaler') || tokenStr.includes('distrib')
            ? 'wholesaler'
            : tokenStr.includes('retail') || tokenStr.includes('pos')
            ? 'retailer'
            : tokenStr.includes('admin')
            ? 'admin'
            : 'farmer';

          request.userProfile = {
            uid: decodedToken.uid,
            email: decodedToken.email || `${inferredRole}@perix.in`,
            role: inferredRole,
            displayName: (decodedToken as any).name || inferredRole.toUpperCase(),
          };
        }
      } catch (dbErr) {
        console.warn('Firestore user fetch failed in AuthGuard, using token inference:', dbErr);
        const tokenStr = (decodedToken.email || decodedToken.uid || '').toLowerCase();
        const inferredRole = tokenStr.includes('mandi')
          ? 'mandi'
          : tokenStr.includes('wholesaler') || tokenStr.includes('distrib')
          ? 'wholesaler'
          : tokenStr.includes('retail')
          ? 'retailer'
          : tokenStr.includes('admin')
          ? 'admin'
          : 'farmer';

        request.userProfile = {
          uid: decodedToken.uid,
          email: decodedToken.email || `${inferredRole}@perix.in`,
          role: inferredRole,
        };
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
