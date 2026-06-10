import { Controller, Post, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('sync')
  async syncUser(@Headers('x-user-id') clerkId: string, @Headers('x-user-email') email: string, @Headers('x-user-name') name: string) {
    if (!clerkId) throw new UnauthorizedException();
    const [firstName, ...rest] = (name || '').split(' ');
    const user = await this.prisma.user.upsert({
      where: { clerkId },
      create: { clerkId, email: email || '', username: clerkId, displayName: name || clerkId },
      update: { email: email || '', lastActiveAt: new Date() },
    });
    return user;
  }

  @Get('me')
  async getMe(@Headers('x-user-id') clerkId: string) {
    if (!clerkId) throw new UnauthorizedException();
    return this.prisma.user.findUnique({ where: { clerkId } });
  }
}
