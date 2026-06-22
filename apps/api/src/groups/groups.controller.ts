import { Controller, Get, Post, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const CITY_GROUPS = [
  { name: 'Dallas Fan Zone 🤠', citySlug: 'dallas', description: 'Official FIFA 2026 fan group for Dallas matches' },
  { name: 'New York/New Jersey Fan Zone 🗽', citySlug: 'new_york', description: 'Official FIFA 2026 fan group for NY/NJ matches' },
  { name: 'Los Angeles Fan Zone 🌴', citySlug: 'los_angeles', description: 'Official FIFA 2026 fan group for LA matches' },
  { name: 'Miami Fan Zone 🌊', citySlug: 'miami', description: 'Official FIFA 2026 fan group for Miami matches' },
  { name: 'Atlanta Fan Zone 🍑', citySlug: 'atlanta', description: 'Official FIFA 2026 fan group for Atlanta matches' },
  { name: 'Houston Fan Zone 🚀', citySlug: 'houston', description: 'Official FIFA 2026 fan group for Houston matches' },
  { name: 'Seattle Fan Zone ☁️', citySlug: 'seattle', description: 'Official FIFA 2026 fan group for Seattle matches' },
  { name: 'San Francisco Bay Area Fan Zone 🌉', citySlug: 'san_francisco', description: 'Official FIFA 2026 fan group for SF Bay Area matches' },
  { name: 'Boston Fan Zone 🦞', citySlug: 'boston', description: 'Official FIFA 2026 fan group for Boston matches' },
  { name: 'Philadelphia Fan Zone 🔔', citySlug: 'philadelphia', description: 'Official FIFA 2026 fan group for Philadelphia matches' },
  { name: 'Kansas City Fan Zone 🎷', citySlug: 'kansas_city', description: 'Official FIFA 2026 fan group for Kansas City matches' },
  { name: 'Mexico City Fan Zone 🌮', citySlug: 'mexico_city', description: 'Official FIFA 2026 fan group for Mexico City matches' },
  { name: 'Guadalajara Fan Zone 🌵', citySlug: 'guadalajara', description: 'Official FIFA 2026 fan group for Guadalajara matches' },
  { name: 'Monterrey Fan Zone 🏔️', citySlug: 'monterrey', description: 'Official FIFA 2026 fan group for Monterrey matches' },
  { name: 'Vancouver Fan Zone 🍁', citySlug: 'vancouver', description: 'Official FIFA 2026 fan group for Vancouver matches' },
  { name: 'Toronto Fan Zone 🏒', citySlug: 'toronto', description: 'Official FIFA 2026 fan group for Toronto matches' },
];

@Controller('groups')
export class GroupsController {
  constructor(private prisma: PrismaService) {}

  private async seedCityGroups() {
    for (const g of CITY_GROUPS) {
      const existing = await this.prisma.group.findFirst({ where: { citySlug: g.citySlug, isOfficial: true } });
      if (!existing) {
        await this.prisma.group.create({
          data: { name: g.name, description: g.description, citySlug: g.citySlug, slug: g.citySlug, isOfficial: true, isPublic: true },
        });
      }
    }
  }

  @Get()
  async findAll(@Query('search') search?: string, @Headers('x-user-id') clerkId?: string) {
    await this.seedCityGroups();
    const user = clerkId ? await this.prisma.user.findUnique({ where: { clerkId } }) : null;

    // Get hidden group IDs for this user
    const hidden = user ? await this.prisma.hiddenGroup.findMany({ where: { userId: user.id } }) : [];
    const hiddenIds = hidden.map((h: any) => h.groupId);

    const groups = await this.prisma.group.findMany({
      where: {
        ...(search ? { name: { contains: search, mode: 'insensitive' as any } } : {}),
        ...(hiddenIds.length > 0 ? { id: { notIn: hiddenIds } } : {}),
      },
      include: {
        _count: { select: { members: true } },
        members: user ? { where: { userId: user.id }, select: { userId: true } } : false,
      },
      orderBy: [{ isOfficial: 'desc' }, { createdAt: 'desc' }],
    });

    return groups.map((g: any) => ({
      ...g,
      isMember: g.members?.length > 0,
      members: undefined,
    }));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('x-user-id') clerkId?: string) {
    const user = clerkId ? await this.prisma.user.findUnique({ where: { clerkId } }) : null;
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        _count: { select: { members: true } },
        members: user ? { where: { userId: user.id }, select: { userId: true } } : false,
      },
    });
    if (!group) return null;
    return { ...group, isMember: (group as any).members?.length > 0, members: undefined };
  }

  @Get(':id/messages')
  async getMessages(@Param('id') id: string) {
    let conversation = await this.prisma.conversation.findFirst({ where: { groupId: id } });
    if (!conversation) return [];
    return this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  @Post(':id/messages')
  async sendMessage(@Param('id') id: string, @Headers('x-user-id') clerkId: string, @Body() body: any) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');

    // Check if user is banned
    const ban = await this.prisma.groupBan.findFirst({
      where: { groupId: id, userId: user.id, bannedUntil: { gt: new Date() } },
    });
    if (ban) {
      const mins = Math.ceil((ban.bannedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`You are banned from this group for ${mins} more minutes.`);
    }

    // Check membership
    const member = await this.prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: id, userId: user.id } } });
    if (!member) throw new Error('You must join this group to send messages');

    let conversation = await this.prisma.conversation.findFirst({ where: { groupId: id } });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({ data: { groupId: id, type: 'group' } });
    }
    return this.prisma.message.create({
      data: { conversationId: conversation.id, senderId: user.id, content: body.content, type: 'TEXT' },
      include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
    });
  }

  @Post()
  async create(@Headers('x-user-id') clerkId: string, @Body() body: any) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');

    // For private groups, verify all members are mutual followers
    if (body.memberIds?.length > 0) {
      for (const memberId of body.memberIds) {
        const iFollow = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: user.id, followingId: memberId } } });
        const theyFollow = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: memberId, followingId: user.id } } });
        if (!iFollow || !theyFollow) throw new Error('You can only add mutual followers to private groups');
      }
    }

    const slug = body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const group = await this.prisma.group.create({
      data: {
        name: body.name,
        description: body.description,
        citySlug: body.citySlug || 'private',
        slug,
        isOfficial: false,
        isPublic: false,
        owner: { connect: { id: user.id } },
      },
    });

    // Add creator as member
    await this.prisma.groupMember.create({ data: { groupId: group.id, userId: user.id } });

    // Add specified members
    if (body.memberIds?.length > 0) {
      for (const memberId of body.memberIds) {
        await this.prisma.groupMember.create({ data: { groupId: group.id, userId: memberId } }).catch(() => {});
      }
    }

    return group;
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const group = await this.prisma.group.findUnique({ where: { id } });
    if (!group) throw new Error('Group not found');
    if (!group.isPublic) throw new Error('This is a private group');
    const existing = await this.prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: id, userId: user.id } } });
    if (existing) return { message: 'Already a member' };
    return this.prisma.groupMember.create({ data: { groupId: id, userId: user.id } });
  }

  @Post(':id/leave')
  async leave(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    return this.prisma.groupMember.delete({ where: { groupId_userId: { groupId: id, userId: user.id } } }).catch(() => ({ message: 'Not a member' }));
  }

  @Post(':id/hide')
  async hide(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    await this.prisma.hiddenGroup.upsert({
      where: { userId_groupId: { userId: user.id, groupId: id } },
      create: { userId: user.id, groupId: id },
      update: {},
    });
    return { success: true };
  }

  @Post(':id/report')
  async report(@Param('id') groupId: string, @Headers('x-user-id') clerkId: string, @Body() body: any) {
    const reporter = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!reporter) throw new Error('User not found');
    const target = await this.prisma.user.findUnique({ where: { id: body.targetUserId } });
    if (!target) throw new Error('Target user not found');

    // Count existing warnings
    const warnings = await this.prisma.groupWarning.count({ where: { groupId, userId: body.targetUserId } });

    if (warnings >= 2) {
      // 3rd offense — 24hr ban
      await this.prisma.groupBan.upsert({
        where: { groupId_userId: { groupId, userId: body.targetUserId } },
        create: { groupId, userId: body.targetUserId, bannedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) },
        update: { bannedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      });
      return { banned: true, message: 'User has been banned for 24 hours' };
    } else {
      // Issue warning
      await this.prisma.groupWarning.create({ data: { groupId, userId: body.targetUserId, reason: body.reason || 'Community guidelines violation' } });
      return { warned: true, warningCount: warnings + 1, message: `Warning ${warnings + 1}/3 issued` };
    }
  }
}
