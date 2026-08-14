import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest();
    const userProfile = request.userProfile;

    if (!userProfile || !userProfile.role) {
      throw new ForbiddenException('User role not found');
    }

    // Admin has access to everything
    if (userProfile.role === 'admin') {
      return true;
    }

    if (!requiredRoles.includes(userProfile.role)) {
      throw new ForbiddenException(
        `Role '${userProfile.role}' does not have access. Required: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
