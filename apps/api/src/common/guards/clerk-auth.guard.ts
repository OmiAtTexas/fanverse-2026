import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { clerkClient, verifyToken } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = await verifyToken(token, {
        secretKey: this.config.get('CLERK_SECRET_KEY'),
      });

      const user = await clerkClient.users.getUser(payload.sub);
      request.user = {
        clerkId: payload.sub,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
      };

      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: Request): string | null {
    const auth = (request.headers as Record<string, string>)['authorization'];
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return null;
  }
}
