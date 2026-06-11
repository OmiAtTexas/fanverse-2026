import { Controller, Get, Post, Param, Query, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Get('search')
  async search(@Query('q') q: string, @Headers('x-user-id') clerkId: string) {
    if (!q || q.length < 2) return [];
    return this.prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: q, mode: 'insensitive' as any } },
          { username: { contains: q, mode: 'insensitive' as any } },
          { nationality: { contains: q, mode: 'insensitive' as any } },
          { supportedTeam: { contains: q, mode: 'insensitive' as any } },
        ],
        NOT: { clerkId },
      },
      select: {
        id: true, clerkId: true, displayName: true, username: true,
        avatarUrl: true, nationality: true, supportedTeam: true, bio: true,
      },
      take: 20,
    });
  }

  @Get('suggestions')
  async suggestions(@Headers('x-user-id') clerkId: string) {
    return this.prisma.user.findMany({
      where: { NOT: { clerkId: clerkId || 'none' } },
      select: {
        id: true, clerkId: true, displayName: true, username: true,
        avatarUrl: true, nationality: true, supportedTeam: true, bio: true,
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get(':id')
  async getProfile(@Param('id') id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, clerkId: true, displayName: true, username: true,
        avatarUrl: true, nationality: true, supportedTeam: true, bio: true,
      },
    });
  }

  @Post(':id/follow')
  async follow(@Param('id') targetId: string, @Headers('x-user-id') clerkId: string) {
    const me = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!me) throw new Error('User not found');
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: me.id, followingId: targetId } },
    });
    if (existing) {
      await this.prisma.follow.delete({
        where: { followerId_followingId: { followerId: me.id, followingId: targetId } },
      });
      return { following: false };
    }
    await this.prisma.follow.create({
      data: { followerId: me.id, followingId: targetId },
    });
    return { following: true };
  }
}
