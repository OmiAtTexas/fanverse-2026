import { Controller, Get, Post, Patch, Param, Query, Headers, Body } from '@nestjs/common';
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
        NOT: { clerkId: clerkId || 'none' },
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

  @Get('connections')
  async getConnections(@Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return [];
    return this.prisma.connection.findMany({
      where: {
        OR: [{ senderId: user.id }, { receiverId: user.id }],
        status: 'ACCEPTED',
      },
      include: {
        sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, supportedTeam: true } },
        receiver: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, supportedTeam: true } },
      },
    });
  }

  @Get('connections/:id')
  async getConnection(@Param('id') id: string) {
    return this.prisma.connection.findUnique({
      where: { id },
      include: {
        sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, nationality: true, supportedTeam: true } },
        receiver: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, nationality: true, supportedTeam: true } },
      },
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

  @Post('me')
  async updateMe(
    @Headers('x-user-id') clerkId: string,
    @Body() body: any,
  ) {
    return this.prisma.user.update({
      where: { clerkId },
      data: {
        nationality: body.nationality,
        supportedTeam: body.supportedTeam,
        bio: body.bio,
        interests: body.interests || [],
        hostCities: body.hostCities || [],
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
