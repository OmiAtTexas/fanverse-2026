import { Controller, Get, Post, Delete, Param, Headers, Body } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('messages')
export class MessagesController {
  constructor(private prisma: PrismaService) {}

  @Get('conversations')
  async getConversations(@Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return [];
    const conversations = await this.prisma.conversation.findMany({
      where: { type: 'direct', members: { some: { userId: user.id } } },
      include: {
        members: { include: { user: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, supportedTeam: true } } } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: { select: { clerkId: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations.map(c => ({
      id: c.id,
      lastMessage: c.messages[0]?.content || '',
      lastMessageAt: c.messages[0]?.createdAt,
      lastMessageSenderClerkId: c.messages[0]?.sender?.clerkId || null,
      other: c.members.find(m => m.userId !== user.id)?.user,
    }));
  }

  @Get('conversations/:id')
  async getMessages(@Param('id') conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });
  }

  @Post('dm/:toClerkId')
  async sendDM(
    @Param('toClerkId') toClerkId: string,
    @Headers('x-user-id') fromClerkId: string,
    @Body() body: any,
  ) {
    const sender = await this.prisma.user.findUnique({ where: { clerkId: fromClerkId } });
    const receiver = await this.prisma.user.findUnique({ where: { clerkId: toClerkId } });
    if (!sender || !receiver) throw new Error('User not found');
    let conversation = await this.prisma.conversation.findFirst({
      where: { type: 'direct', AND: [{ members: { some: { userId: sender.id } } }, { members: { some: { userId: receiver.id } } }] },
    });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: { type: 'direct', members: { create: [{ userId: sender.id }, { userId: receiver.id }] } },
      });
    }
    return this.prisma.message.create({
      data: { conversationId: conversation.id, senderId: sender.id, content: body.content, type: 'TEXT' },
      include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
    });
  }

  @Delete('conversations/:id')
  async deleteConversation(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    // Delete all messages first, then conversation
    await this.prisma.message.deleteMany({ where: { conversationId: id } });
    await this.prisma.conversationMember.deleteMany({ where: { conversationId: id } });
    await this.prisma.conversation.delete({ where: { id } });
    return { success: true };
  }

  @Post('reactions/:messageId')
  async addReaction(@Param('messageId') messageId: string, @Headers('x-user-id') clerkId: string, @Body() body: any) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const existing = await this.prisma.$queryRawUnsafe(`SELECT id FROM message_reactions WHERE message_id = '${messageId}' AND user_id = '${user.id}' AND emoji = '${body.emoji}'`) as any[];
    if (existing.length > 0) {
      await this.prisma.$queryRawUnsafe(`DELETE FROM message_reactions WHERE message_id = '${messageId}' AND user_id = '${user.id}' AND emoji = '${body.emoji}'`);
      return { removed: true };
    }
    await this.prisma.$queryRawUnsafe(`INSERT INTO message_reactions (id, message_id, user_id, emoji) VALUES (gen_random_uuid()::text, '${messageId}', '${user.id}', '${body.emoji}') ON CONFLICT DO NOTHING`);
    return { added: true };
  }

  @Get('reactions/:messageId')
  async getReactions(@Param('messageId') messageId: string) {
    const reactions = await this.prisma.$queryRawUnsafe(`
      SELECT mr.emoji, u.display_name as "displayName", u.clerk_id as "clerkId"
      FROM message_reactions mr
      JOIN users u ON u.id = mr.user_id
      WHERE mr.message_id = '${messageId}'
    `) as any[];
    // Group by emoji
    const grouped: any = {};
    for (const r of reactions) {
      if (!grouped[r.emoji]) grouped[r.emoji] = { emoji: r.emoji, count: 0, users: [] };
      grouped[r.emoji].count++;
      grouped[r.emoji].users.push(r.clerkId);
    }
    return Object.values(grouped);
  }
}
