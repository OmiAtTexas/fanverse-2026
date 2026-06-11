import {
  WebSocketGateway, WebSocketServer, SubscribeMessage,
  OnGatewayConnection, OnGatewayDisconnect, MessageBody, ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma.service';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private userSockets = new Map<string, string>();

  constructor(private prisma: PrismaService) {}

  handleConnection(client: Socket) {
    const clerkId = client.handshake.query.clerkId as string;
    if (clerkId) this.userSockets.set(clerkId, client.id);
  }

  handleDisconnect(client: Socket) {
    for (const [clerkId, socketId] of this.userSockets) {
      if (socketId === client.id) { this.userSockets.delete(clerkId); break; }
    }
  }

  @SubscribeMessage('joinGroup')
  async joinGroup(@MessageBody() data: { groupId: string }, @ConnectedSocket() client: Socket) {
    client.join('group:' + data.groupId);
    let conversation = await this.prisma.conversation.findFirst({ where: { groupId: data.groupId } });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({ data: { groupId: data.groupId, type: 'group' } });
    }
    const messages = await this.prisma.message.findMany({
      where: { conversationId: conversation.id },
      include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    client.emit('groupHistory', messages.reverse());
  }

  @SubscribeMessage('sendGroupMessage')
  async sendGroupMessage(@MessageBody() data: { groupId: string; content: string; clerkId: string }) {
    const user = await this.prisma.user.findUnique({ where: { clerkId: data.clerkId } });
    if (!user) return;
    let conversation = await this.prisma.conversation.findFirst({ where: { groupId: data.groupId } });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({ data: { groupId: data.groupId, type: 'group' } });
    }
    const message = await this.prisma.message.create({
      data: { conversationId: conversation.id, senderId: user.id, content: data.content, type: 'TEXT' },
      include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
    });
    this.server.to('group:' + data.groupId).emit('newGroupMessage', message);
  }

  @SubscribeMessage('sendDM')
  async sendDM(@MessageBody() data: { toClerkId: string; content: string; fromClerkId: string }) {
    const sender = await this.prisma.user.findUnique({ where: { clerkId: data.fromClerkId } });
    const receiver = await this.prisma.user.findUnique({ where: { clerkId: data.toClerkId } });
    if (!sender || !receiver) return;
    const connection = await this.prisma.connection.findFirst({
      where: { OR: [{ senderId: sender.id, receiverId: receiver.id }, { senderId: receiver.id, receiverId: sender.id }], status: 'ACCEPTED' },
    });
    if (!connection) return;
    let conversation = await this.prisma.conversation.findUnique({ where: { connectionId: connection.id } });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({ data: { connectionId: connection.id, type: 'direct' } });
    }
    const message = await this.prisma.message.create({
      data: { conversationId: conversation.id, senderId: sender.id, content: data.content, type: 'TEXT' },
      include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
    });
    const receiverSocketId = this.userSockets.get(data.toClerkId);
    if (receiverSocketId) this.server.to(receiverSocketId).emit('newDM', message);
    const senderSocketId = this.userSockets.get(data.fromClerkId);
    if (senderSocketId) this.server.to(senderSocketId).emit('newDM', message);
  }
}
