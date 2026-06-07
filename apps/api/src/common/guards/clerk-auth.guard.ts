import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) throw new UnauthorizedException('No token');
    request.user = { clerkId: 'user', token: auth.slice(7) };
    return true;
  }
}
