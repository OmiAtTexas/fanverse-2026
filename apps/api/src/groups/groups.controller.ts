import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const CITY_GROUPS = [
  { name: 'Dallas Fan Zone 🤠', citySlug: 'dallas', description: 'Official FIFA 2026 fan group for Dallas matches' },
  { name: 'New York/New Jersey Fan Zone 🗽', citySlug: 'new_york', description: 'Official FIFA 2026 fan group for NY/NJ matches' },
  { name: 'Los Angeles Fan Zone 🌴', citySlug: 'los_angeles', description: 'Official FIFA 2026 fan group for LA matches' },
  { name: 'Miami Fan Zone 🌊', citySlug: 'miami', description: 'Official FIFA 2026 fan group for Miami matches' },
  { name: 'Atlanta Fan Zone 🍑', citySlug: 'atlanta', description: 'Official FIFA 2026 fan group for Atlanta matches' },
  { name: 'Houston Fan Zone 🚀', citySlug: 'houston', description: 'Official FIFA 2026 fan group for Houston matches' },
  { name: 'Seattle Fan Zone ☁️', citySlug: 'seattle', description: 'Official FIFA 2026 fan group for Seattle matches' },
  { name: 'San Francisco Bay Area Fan Zone 🌉', citySlug: 'san_francisco', description: 'Official FIFA 2026 fan group for SF matches' },
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
    // Get the first user to use as owner for official groups
    const adminUser = await this.prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
    if (!adminUser) return;

    for (const g of CITY_GROUPS) {
      const existing = await this.prisma.$queryRaw`
        SELECT id FROM groups WHERE city_slug = ${g.citySlug} AND is_official = true LIMIT 1
      ` as any[];
      if (!existing?.length) {
        const id = 'city-' + g.citySlug;
        await this.prisma.$executeRaw`
          INSERT INTO groups (id, name, description, slug, city_slug, is_official, is_public, owner_id, updated_at)
          VALUES (${id}, ${g.name}, ${g.description}, ${g.citySlug}, ${g.citySlug}, true, true, ${adminUser.id}, NOW())
          ON CONFLICT (slug) DO NOTHING
        `;
      }
    }
  }

  @Get()
  async findAll(@Query('search') search?: string, @Headers('x-user-id') clerkId?: string) {
    await this.seedCityGroups();

    const user = clerkId ? await this.prisma.user.findUnique({ where: { clerkId } }) : null;

    // Get hidden group IDs
    const hidden = user ? await this.prisma.$queryRaw`
      SELECT group_id FROM hidden_groups WHERE user_id = ${user.id}
    ` as any[] : [];
    const hiddenIds = hidden.map((h: any) => h.group_id);

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

    // Check ban
    const bans = await this.prisma.$queryRaw`
      SELECT * FROM group_bans WHERE group_id = ${id} AND user_id = ${user.id} AND banned_until > NOW() LIMIT 1
    ` as any[];
    if (bans?.length > 0) {
      const ban = bans[0];
      const mins = Math.ceil((new Date(ban.banned_until).getTime() - Date.now()) / 60000);
      throw new Error(`You are banned from this group for ${mins} more minutes.`);
    }

    // Check membership
    const member = await this.prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: id, userId: user.id } } });
    if (!member) throw new Error('You must join this group to send messages');

    let conversation = await this.prisma.conversation.findFirst({ where: { groupId: id } });
    if (!conversation) conversation = await this.prisma.conversation.create({ data: { groupId: id, type: 'group' } });

    return this.prisma.message.create({
      data: { conversationId: conversation.id, senderId: user.id, content: body.content, type: 'TEXT' },
      include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
    });
  }

  @Post()
  async create(@Headers('x-user-id') clerkId: string, @Body() body: any) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const slug = body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const group = await this.prisma.group.create({
      data: { name: body.name, description: body.description, citySlug: 'private', slug, isPublic: false, owner: { connect: { id: user.id } } },
    });
    await this.prisma.groupMember.create({ data: { groupId: group.id, userId: user.id } });
    return group;
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
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
    await this.prisma.$executeRaw`
      INSERT INTO hidden_groups (id, user_id, group_id)
      VALUES (gen_random_uuid()::text, ${user.id}, ${id})
      ON CONFLICT (user_id, group_id) DO NOTHING
    `;
    return { success: true };
  }

  @Post(':id/report')
  async report(@Param('id') groupId: string, @Headers('x-user-id') clerkId: string, @Body() body: any) {
    const reporter = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!reporter) throw new Error('User not found');

    const warnings = await this.prisma.$queryRaw`
      SELECT COUNT(*) as count FROM group_warnings WHERE group_id = ${groupId} AND user_id = ${body.targetUserId}
    ` as any[];
    const warnCount = Number(warnings[0]?.count || 0);

    if (warnCount >= 2) {
      await this.prisma.$executeRaw`
        INSERT INTO group_bans (id, group_id, user_id, banned_until)
        VALUES (gen_random_uuid()::text, ${groupId}, ${body.targetUserId}, NOW() + INTERVAL '24 hours')
        ON CONFLICT (group_id, user_id) DO UPDATE SET banned_until = NOW() + INTERVAL '24 hours'
      `;
      return { banned: true, message: 'User has been banned for 24 hours' };
    } else {
      await this.prisma.$executeRaw`
        INSERT INTO group_warnings (id, group_id, user_id, reason)
        VALUES (gen_random_uuid()::text, ${groupId}, ${body.targetUserId}, ${body.reason || 'Community guidelines violation'})
      `;
      return { warned: true, warningCount: warnCount + 1, message: `Warning ${warnCount + 1}/3 issued` };
    }
  }
}
