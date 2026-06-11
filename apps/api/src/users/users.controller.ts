import { Controller, Get, Post, Param, Query, Headers, Body } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  private async getUsersWithStatus(users: any[], meId: string) {
    const myFollows = await this.prisma.follow.findMany({ where: { followerId: meId } });
    const myRequests = await this.prisma.followRequest.findMany({ where: { fromId: meId } });
    const theirFollows = await this.prisma.follow.findMany({ where: { followerId: { in: users.map(u => u.id) }, followingId: meId } });

    return users.map(u => ({
      ...u,
      followStatus: myFollows.find(f => f.followingId === u.id) ? 'following'
        : myRequests.find(r => r.toId === u.id)?.status === 'PENDING' ? 'requested'
        : 'none',
      followsMe: !!theirFollows.find(f => f.followerId === u.id),
      canChat: !!myFollows.find(f => f.followingId === u.id) && !!theirFollows.find(f => f.followerId === u.id),
    }));
  }

  @Get('search')
  async search(@Query('q') q: string, @Headers('x-user-id') clerkId: string) {
    if (!q || q.length < 2) return [];
    const me = await this.prisma.user.findUnique({ where: { clerkId } });
    const users = await this.prisma.user.findMany({
      where: { OR: [{ displayName: { contains: q, mode: 'insensitive' as any } }, { username: { contains: q, mode: 'insensitive' as any } }, { nationality: { contains: q, mode: 'insensitive' as any } }, { supportedTeam: { contains: q, mode: 'insensitive' as any } }], NOT: { clerkId: clerkId || 'none' } },
      select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, _count: { select: { followers: true, following: true } } },
      take: 20,
    });
    return me ? this.getUsersWithStatus(users, me.id) : users;
  }

  @Get('suggestions')
  async suggestions(@Headers('x-user-id') clerkId: string) {
    const me = await this.prisma.user.findUnique({ where: { clerkId } });
    const users = await this.prisma.user.findMany({
      where: { NOT: { clerkId: clerkId || 'none' } },
      select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, _count: { select: { followers: true, following: true } } },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    return me ? this.getUsersWithStatus(users, me.id) : users;
  }

  @Get('follow-requests')
  async getFollowRequests(@Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return [];
    return this.prisma.followRequest.findMany({
      where: { toId: user.id, status: 'PENDING' },
      include: { from: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, nationality: true, supportedTeam: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post(':id/follow-request')
  async sendFollowRequest(@Param('id') targetId: string, @Headers('x-user-id') clerkId: string) {
    const me = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!me) throw new Error('User not found');
    const existing = await this.prisma.followRequest.findFirst({ where: { fromId: me.id, toId: targetId } });
    if (existing) return { message: 'Request already sent', status: existing.status };
    return this.prisma.followRequest.create({ data: { fromId: me.id, toId: targetId, status: 'PENDING' } });
  }

  @Post('follow-requests/:id/accept')
  async acceptFollowRequest(@Param('id') requestId: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const request = await this.prisma.followRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Request not found');
    await this.prisma.followRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } });
    await this.prisma.follow.create({ data: { followerId: request.fromId, followingId: user.id } });
    return { success: true };
  }

  @Post('follow-requests/:id/decline')
  async declineFollowRequest(@Param('id') requestId: string, @Headers('x-user-id') clerkId: string) {
    await this.prisma.followRequest.update({ where: { id: requestId }, data: { status: 'DECLINED' } });
    return { success: true };
  }

  @Get('connections')
  async getConnections(@Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return [];
    return this.prisma.connection.findMany({
      where: { OR: [{ senderId: user.id }, { receiverId: user.id }], status: 'ACCEPTED' },
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
      select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, _count: { select: { followers: true, following: true } } },
    });
  }

  @Post('me')
  async updateMe(@Headers('x-user-id') clerkId: string, @Body() body: any) {
    return this.prisma.user.update({
      where: { clerkId },
      data: { nationality: body.nationality, supportedTeam: body.supportedTeam, bio: body.bio, interests: body.interests || [], hostCities: body.hostCities || [] },
    });
  }

  @Post(':id/follow')
  async follow(@Param('id') targetId: string, @Headers('x-user-id') clerkId: string) {
    const me = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!me) throw new Error('User not found');
    const existing = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: me.id, followingId: targetId } } });
    if (existing) {
      await this.prisma.follow.delete({ where: { followerId_followingId: { followerId: me.id, followingId: targetId } } });
      return { following: false };
    }
    await this.prisma.follow.create({ data: { followerId: me.id, followingId: targetId } });
    return { following: true };
  }
}
