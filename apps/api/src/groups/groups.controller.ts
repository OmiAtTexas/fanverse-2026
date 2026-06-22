import { Controller, Get, Post, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('groups')
export class GroupsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('search') search?: string, @Headers('x-user-id') clerkId?: string) {
    const user = clerkId ? await this.prisma.user.findUnique({ where: { clerkId } }) : null;

    let hiddenIds: string[] = [];
    let memberGroupIds = new Set<string>();

    if (user) {
      try {
        const hidden: any[] = await this.prisma.$queryRawUnsafe(`SELECT group_id FROM hidden_groups WHERE user_id = '${user.id}'`);
        hiddenIds = hidden.map(h => h.group_id);
      } catch (e) {}
      try {
        const memberGroups: any[] = await this.prisma.$queryRawUnsafe(`SELECT group_id FROM group_members WHERE user_id = '${user.id}'`);
        memberGroupIds = new Set(memberGroups.map(m => m.group_id));
      } catch (e) {}
    }

    const rawGroups: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT g.id, g.name, g.description, g.slug, g.city_slug as "citySlug",
             g.is_official as "isOfficial", g.is_public as "isPublic",
             g.owner_id as "ownerId", g.created_at as "createdAt",
             (SELECT COUNT(*)::int FROM group_members WHERE group_id = g.id) as "memberCount"
      FROM groups g
      ORDER BY g.is_official DESC, g.created_at DESC
    `);

    return rawGroups
      .filter(g => !hiddenIds.includes(g.id))
      .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()))
      .map(g => ({ ...g, isMember: memberGroupIds.has(g.id), _count: { members: g.memberCount } }));
  }


  @Get('hidden')
  async getHidden(@Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return [];
    try {
      const hidden: any[] = await this.prisma.$queryRawUnsafe(`SELECT g.id, g.name, g.city_slug as "citySlug", g.is_official as "isOfficial" FROM groups g INNER JOIN hidden_groups hg ON hg.group_id = g.id WHERE hg.user_id = '${user.id}'`);
      return hidden;
    } catch (e) { return []; }
  }

  @Post(':id/unhide')
  async unhide(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    await this.prisma.$queryRawUnsafe(`DELETE FROM hidden_groups WHERE user_id = '${user.id}' AND group_id = '${id}'`);
    return { success: true };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers('x-user-id') clerkId?: string) {
    const user = clerkId ? await this.prisma.user.findUnique({ where: { clerkId } }) : null;
    const groups: any[] = await this.prisma.$queryRawUnsafe(`
      SELECT g.id, g.name, g.description, g.slug, g.city_slug as "citySlug",
             g.is_official as "isOfficial", g.is_public as "isPublic",
             g.owner_id as "ownerId", g.created_at as "createdAt",
             (SELECT COUNT(*)::int FROM group_members WHERE group_id = g.id) as "memberCount"
      FROM groups g WHERE g.id = '${id}' LIMIT 1
    `);
    if (!groups.length) return null;
    const g = groups[0];
    let isMember = false;
    if (user) {
      try {
        const check: any[] = await this.prisma.$queryRawUnsafe(`SELECT 1 FROM group_members WHERE group_id = '${id}' AND user_id = '${user.id}' LIMIT 1`);
        isMember = check.length > 0;
      } catch (e) {}
    }
    return { ...g, isMember, _count: { members: g.memberCount } };
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
    try {
      const bans: any[] = await this.prisma.$queryRawUnsafe(`SELECT * FROM group_bans WHERE group_id = '${id}' AND user_id = '${user.id}' AND banned_until > NOW() LIMIT 1`);
      if (bans.length > 0) {
        const mins = Math.ceil((new Date(bans[0].banned_until).getTime() - Date.now()) / 60000);
        throw new Error(`You are banned for ${mins} more minutes`);
      }
    } catch (e: any) { if (e.message.includes('banned')) throw e; }
    const member = await this.prisma.groupMember.findUnique({ where: { groupId_userId: { groupId: id, userId: user.id } } });
    if (!member) throw new Error('Join this group to send messages');
    let conv = await this.prisma.conversation.findFirst({ where: { groupId: id } });
    if (!conv) conv = await this.prisma.conversation.create({ data: { groupId: id, type: 'group' } });
    return this.prisma.message.create({
      data: { conversationId: conv.id, senderId: user.id, content: body.content, type: 'TEXT' },
      include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
    });
  }

  @Post()
  async create(@Headers('x-user-id') clerkId: string, @Body() body: any) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const slug = body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const group = await this.prisma.group.create({
      data: { name: body.name, description: body.description || '', citySlug: 'private', slug, isPublic: false, owner: { connect: { id: user.id } } },
    });
    await this.prisma.groupMember.create({ data: { groupId: group.id, userId: user.id } });
    return group;
  }


  @Delete(':id/messages/:msgId')
  async deleteMessage(@Param('id') id: string, @Param('msgId') msgId: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const message = await this.prisma.message.findUnique({ where: { id: msgId } });
    if (!message || message.senderId !== user.id) throw new Error('Not authorized');
    await this.prisma.message.delete({ where: { id: msgId } });
    return { success: true };
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
    await this.prisma.$queryRawUnsafe(`INSERT INTO hidden_groups (id, user_id, group_id) VALUES (gen_random_uuid()::text, '${user.id}', '${id}') ON CONFLICT (user_id, group_id) DO NOTHING`);
    return { success: true };
  }

  @Post(':id/report')
  async report(@Param('id') groupId: string, @Headers('x-user-id') clerkId: string, @Body() body: any) {
    const reporter = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!reporter) throw new Error('User not found');
    const warnings: any[] = await this.prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM group_warnings WHERE group_id = '${groupId}' AND user_id = '${body.targetUserId}'`);
    const warnCount = Number(warnings[0]?.count || 0);
    if (warnCount >= 2) {
      await this.prisma.$queryRawUnsafe(`INSERT INTO group_bans (id, group_id, user_id, banned_until) VALUES (gen_random_uuid()::text, '${groupId}', '${body.targetUserId}', NOW() + INTERVAL '24 hours') ON CONFLICT (group_id, user_id) DO UPDATE SET banned_until = NOW() + INTERVAL '24 hours'`);
      return { banned: true, message: 'User banned for 24 hours' };
    } else {
      await this.prisma.$queryRawUnsafe(`INSERT INTO group_warnings (id, group_id, user_id, reason) VALUES (gen_random_uuid()::text, '${groupId}', '${body.targetUserId}', '${body.reason || 'Guidelines violation'}')`);
      return { warned: true, warningCount: warnCount + 1 };
    }
  }
}
