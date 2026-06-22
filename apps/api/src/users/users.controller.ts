import { Controller, Get, Post, Patch, Param, Query, Headers, Body } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('users')
export class UsersController {
  constructor(private prisma: PrismaService) {}

  private async enrichUsers(users: any[], clerkId: string) {
    const me = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!me) return users.map(u => ({ ...u, followStatus: null, canChat: false }));
    const sentRequests = await this.prisma.followRequest.findMany({ where: { fromId: me.id } });
    const acceptedFollows = await this.prisma.follow.findMany({ where: { followerId: me.id } });
    const theyFollowMe = await this.prisma.follow.findMany({ where: { followingId: me.id, followerId: { in: users.map(u => u.id) } } });
    return users.map(u => {
      const req = sentRequests.find(r => r.toId === u.id);
      const iFollow = acceptedFollows.find(f => f.followingId === u.id);
      const theyFollow = theyFollowMe.find(f => f.followerId === u.id);
      return {
        ...u,
        followStatus: iFollow ? 'following' : req?.status === 'PENDING' ? 'requested' : null,
        followsMe: !!theyFollow,
        canChat: !!iFollow && !!theyFollow,
      };
    });
  }

  @Get('search')
  async search(@Query('q') q: string, @Headers('x-user-id') clerkId: string) {
    if (!q || q.length < 2) return [];
    const users = await this.prisma.user.findMany({
      where: { OR: [{ displayName: { contains: q, mode: 'insensitive' as any } }, { username: { contains: q, mode: 'insensitive' as any } }, { nationality: { contains: q, mode: 'insensitive' as any } }, { supportedTeam: { contains: q, mode: 'insensitive' as any } }], NOT: { clerkId: clerkId || 'none' } },
      select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, interests: true, hostCities: true, _count: { select: { followers: true, following: true } } },
      take: 20,
    });
    return this.enrichUsers(users, clerkId);
  }

  @Get('suggestions')
  async suggestions(@Headers('x-user-id') clerkId: string) {
    const users = await this.prisma.user.findMany({
      where: { NOT: { clerkId: clerkId || 'none' } },
      select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, interests: true, hostCities: true, _count: { select: { followers: true, following: true } } },
      take: 20, orderBy: { createdAt: 'desc' },
    });
    return this.enrichUsers(users, clerkId);
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

  // IMPORTANT: @Post('me') and @Patch('me') MUST come before
  private async updateProfile(clerkId: string, body: any) {
    return this.prisma.user.update({
      where: { clerkId },
      data: {
        nationality: body.nationality || null,
        supportedTeam: body.supportedTeam || null,
        bio: body.bio || null,
        interests: body.interests || [],
        hostCities: body.hostCities || [],
        displayName: body.displayName || undefined,
      },
    });
  }
 @Get(':id')
  // otherwise NestJS will match 'me' as an :id param
  @Post('me')
  async updateMePost(@Headers('x-user-id') clerkId: string, @Body() body: any) {
    return this.updateProfile(clerkId, body);
  }

  @Patch('me')
  async updateMe(@Headers('x-user-id') clerkId: string, @Body() body: any) {
    return this.prisma.user.update({
      where: { clerkId },
      data: {
        nationality: body.nationality || null,
        supportedTeam: body.supportedTeam || null,
        bio: body.bio || null,
        interests: body.interests || [],
        hostCities: body.hostCities || [],
        displayName: body.displayName || undefined,
      },
    });
  }

  @Post(':id/follow-request')
  async sendFollowRequest(@Param('id') targetId: string, @Headers('x-user-id') clerkId: string) {
    const me = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!me) throw new Error('User not found');
    const existing = await this.prisma.followRequest.findFirst({ where: { fromId: me.id, toId: targetId } });
    if (existing) return { status: existing.status };
    return this.prisma.followRequest.create({ data: { fromId: me.id, toId: targetId, status: 'PENDING' } });
  }

  @Post(':id/unfollow')
  async unfollow(@Param('id') targetId: string, @Headers('x-user-id') clerkId: string) {
    const me = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!me) throw new Error('User not found');
    await this.prisma.follow.deleteMany({ where: { followerId: me.id, followingId: targetId } });
    await this.prisma.followRequest.deleteMany({ where: { fromId: me.id, toId: targetId } });
    const conversation = await this.prisma.conversation.findFirst({
      where: { type: 'direct', AND: [{ members: { some: { userId: me.id } } }, { members: { some: { userId: targetId } } }] },
    });
    if (conversation) await this.prisma.conversation.delete({ where: { id: conversation.id } });
    return { success: true };
  }

  @Post('follow-requests/:id/accept')
  async acceptFollowRequest(@Param('id') requestId: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const request = await this.prisma.followRequest.findUnique({ where: { id: requestId } });
    if (!request || request.toId !== user.id) throw new Error('Not found');
    await this.prisma.followRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } });
    const alreadyFollows = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: request.fromId, followingId: user.id } } });
    if (!alreadyFollows) await this.prisma.follow.create({ data: { followerId: request.fromId, followingId: user.id } });
    return { success: true };
  }

  @Post('follow-requests/:id/decline')
  async declineFollowRequest(@Param('id') requestId: string) {
    await this.prisma.followRequest.update({ where: { id: requestId }, data: { status: 'DECLINED' } });
    return { success: true };
  }

  @Get(':id')
  async getProfile(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, interests: true, hostCities: true, _count: { select: { followers: true, following: true } } },
    });
    if (!user) return null;
    const [enriched] = await this.enrichUsers([user], clerkId);
    return enriched;
  }
}
