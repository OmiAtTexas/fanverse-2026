import { Controller, Post, Get, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Post('sync')
  async syncUser(
    @Headers('x-user-id') clerkId: string,
    @Headers('x-user-email') email: string,
    @Headers('x-user-name') name: string,
    @Headers('x-user-avatar') avatarUrl: string,
  ) {
    if (!clerkId) return { error: 'No user id' };
    const displayName = name || email?.split('@')[0] || clerkId;
    const username = (email?.split('@')[0] || clerkId).replace(/[^a-zA-Z0-9_]/g, '_') + '_' + clerkId.slice(-4);
    const user = await this.prisma.user.upsert({
      where: { clerkId },
      create: {
        clerkId,
        email: email || `${clerkId}@fanverse.app`,
        username,
        displayName,
        avatarUrl: avatarUrl || null,
        lastActiveAt: new Date(),
      },
      update: {
        email: email || undefined,
        displayName,
        avatarUrl: avatarUrl || undefined,
        lastActiveAt: new Date(),
      },
    });
    // Never return email
    const { email: _email, ...safeUser } = user as any;
    return safeUser;
  }

  @Get('me')
  async getMe(@Headers('x-user-id') clerkId: string) {
    if (!clerkId) return null;
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true, clerkId: true, displayName: true, username: true,
        avatarUrl: true, nationality: true, supportedTeam: true, bio: true,
        interests: true, hostCities: true,
      },
    });
    if (!user) return null;
    const followerCount = await this.prisma.follow.count({ where: { followingId: user.id } });
    const followingCount = await this.prisma.follow.count({ where: { followerId: user.id } });
    return { ...user, _count: { followers: followerCount, following: followingCount } };
  }
}
// Sat Jun 27 15:34:42 CDT 2026
