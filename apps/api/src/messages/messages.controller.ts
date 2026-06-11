import { Controller, Get, Post, Param, Headers, Body } from '@nestjs/common';
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
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return conversations.map(c => ({
      id: c.id,
      lastMessage: c.messages[0]?.content || '',
      lastMessageAt: c.messages[0]?.createdAt,
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
}
