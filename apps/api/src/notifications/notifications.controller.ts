import { Controller, Get, Post, Param, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async getNotifications(@Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return [];

    const followRequests = await this.prisma.followRequest.findMany({
      where: { toId: user.id, status: 'PENDING' },
      include: { from: { select: { id: true, displayName: true, avatarUrl: true, supportedTeam: true, nationality: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const accepted = await this.prisma.followRequest.findMany({
      where: { fromId: user.id, status: 'ACCEPTED' },
      include: { to: { select: { id: true, displayName: true, avatarUrl: true, supportedTeam: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const followers = await this.prisma.follow.findMany({
      where: { followingId: user.id },
      include: { follower: { select: { id: true, displayName: true, avatarUrl: true, supportedTeam: true, nationality: true } } },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const notifications = [
      ...followRequests.map(r => ({
        id: `req-${r.id}`,
        type: 'follow_request',
        message: `${r.from.displayName} sent you a follow request`,
        user: r.from,
        createdAt: r.createdAt,
        actionId: r.id,
      })),
      ...accepted.map(r => ({
        id: `acc-${r.id}`,
        type: 'request_accepted',
        message: `${r.to.displayName} accepted your follow request`,
        user: r.to,
        createdAt: r.createdAt,
      })),
      ...followers.map(f => ({
        id: `fol-${f.id}`,
        type: 'new_follower',
        message: `${f.follower.displayName} started following you`,
        user: f.follower,
        createdAt: f.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 30);

    return notifications;
  }

  @Post('follow-requests/:id/accept')
  async accept(@Param('id') requestId: string, @Headers('x-user-id') clerkId: string) {
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
  async decline(@Param('id') requestId: string) {
    await this.prisma.followRequest.update({ where: { id: requestId }, data: { status: 'DECLINED' } });
    return { success: true };
  }
}
