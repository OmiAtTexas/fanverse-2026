import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtWsGuard } from '../../common/guards/jwt-ws.guard';
import { ChatService } from './chat.service';
import { ModerationService } from '../moderation/moderation.service';

// ============================================================
// FANVERSE 2026 — REAL-TIME CHAT GATEWAY
// Socket.io WebSocket server for:
// - Group chats (city groups, team groups)
// - Direct messages between matched fans
// - Live notifications (nearby fans, meetup alerts)
// - Typing indicators
// - Online presence
// ============================================================

interface AuthenticatedSocket extends Socket {
  userId: string;
  username: string;
}

interface SendMessageDto {
  conversationId: string;
  content: string;
  type?: 'text' | 'image' | 'location_share';
  metadata?: Record<string, any>;
  language?: string;
}

interface JoinRoomDto {
  conversationId: string;
}

interface TypingDto {
  conversationId: string;
  isTyping: boolean;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'https://fanverse.app',
    credentials: true,
  },
  namespace: '/realtime',
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  // Track online users: userId -> Set of socketIds
  private onlineUsers = new Map<string, Set<string>>();

  constructor(
    private chatService: ChatService,
    private moderationService: ModerationService,
  ) {}

  // ============================================================
  // CONNECTION LIFECYCLE
  // ============================================================

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Verify JWT token
      const userId = await this.authenticateSocket(client);
      if (!userId) {
        client.disconnect();
        return;
      }

      client.userId = userId;
      this.logger.log(`Fan connected: ${userId} (${client.id})`);

      // Track online presence
      if (!this.onlineUsers.has(userId)) {
        this.onlineUsers.set(userId, new Set());
      }
      this.onlineUsers.get(userId)!.add(client.id);

      // Auto-join the user's groups
      const userRooms = await this.chatService.getUserConversationIds(userId);
      userRooms.forEach(roomId => client.join(`conv:${roomId}`));

      // Join personal notification room
      client.join(`user:${userId}`);

      // Broadcast presence to connections
      await this.broadcastPresence(userId, true);

      // Deliver any missed notifications
      await this.deliverPendingNotifications(client, userId);

    } catch (error) {
      this.logger.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (!client.userId) return;

    const sockets = this.onlineUsers.get(client.userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(client.userId);
        // Only broadcast offline when ALL sockets disconnect
        await this.broadcastPresence(client.userId, false);
      }
    }

    this.logger.log(`Fan disconnected: ${client.userId}`);
  }

  // ============================================================
  // MESSAGE HANDLING
  // ============================================================

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: SendMessageDto,
  ) {
    try {
      // 1. Validate user is member of this conversation
      const isMember = await this.chatService.isConversationMember(
        client.userId,
        dto.conversationId,
      );
      if (!isMember) {
        client.emit('error', { code: 'FORBIDDEN', message: 'Not a member of this conversation' });
        return;
      }

      // 2. Run moderation
      const modResult = await this.moderationService.checkMessage(dto.content, client.userId);
      if (modResult.blocked) {
        client.emit('message_rejected', {
          reason: 'Message violates community guidelines',
          code: modResult.reason,
        });
        return;
      }

      // 3. Save message to DB
      const message = await this.chatService.saveMessage({
        conversationId: dto.conversationId,
        senderId: client.userId,
        content: dto.content,
        type: dto.type ?? 'text',
        metadata: dto.metadata,
        isFlagged: modResult.flagged,
        moderationScore: modResult.score,
      });

      // 4. Auto-translate if needed (async, don't block response)
      this.chatService.queueTranslation(message.id, dto.content).catch(() => {});

      // 5. Broadcast to all members of the conversation
      this.server.to(`conv:${dto.conversationId}`).emit('new_message', {
        ...message,
        senderUsername: client.username,
      });

      // 6. Send push notifications to offline members
      this.chatService.sendPushToOfflineMembers(
        dto.conversationId,
        client.userId,
        dto.content,
        this.onlineUsers,
      ).catch(() => {});

    } catch (error) {
      this.logger.error('Message send error:', error);
      client.emit('error', { code: 'SEND_FAILED', message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: JoinRoomDto,
  ) {
    const isMember = await this.chatService.isConversationMember(
      client.userId,
      dto.conversationId,
    );

    if (!isMember) {
      client.emit('error', { code: 'FORBIDDEN' });
      return;
    }

    client.join(`conv:${dto.conversationId}`);

    // Send recent messages
    const messages = await this.chatService.getRecentMessages(dto.conversationId, 50);
    client.emit('conversation_history', { conversationId: dto.conversationId, messages });

    // Update last-read timestamp
    await this.chatService.markAsRead(client.userId, dto.conversationId);
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: TypingDto,
  ) {
    // Broadcast typing indicator to all OTHER members
    client.to(`conv:${dto.conversationId}`).emit('user_typing', {
      userId: client.userId,
      conversationId: dto.conversationId,
      isTyping: dto.isTyping,
    });
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    await this.chatService.markAsRead(client.userId, data.conversationId);
  }

  // ============================================================
  // REAL-TIME NOTIFICATIONS
  // ============================================================

  // Called by other services to push notifications to specific users
  async notifyUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Called when a fan match suggestion is ready
  async notifyFanMatch(userId: string, matchedUser: any) {
    this.server.to(`user:${userId}`).emit('fan_match', {
      type: 'fan_match',
      user: matchedUser,
      timestamp: new Date().toISOString(),
    });
  }

  // Called for nearby fan alerts (geo-based)
  async notifyNearbyFan(userId: string, nearbyUser: any, distanceMeters: number) {
    this.server.to(`user:${userId}`).emit('nearby_fan', {
      user: nearbyUser,
      distanceMeters,
      timestamp: new Date().toISOString(),
    });
  }

  // Broadcast to an entire city group
  async broadcastToCity(citySlug: string, event: string, data: any) {
    this.server.to(`city:${citySlug}`).emit(event, data);
  }

  // ============================================================
  // HELPERS
  // ============================================================

  private async authenticateSocket(client: Socket): Promise<string | null> {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) return null;

    try {
      // Verify with Clerk JWT
      const { verifyToken } = await import('@clerk/backend');
      const payload = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });
      return payload.sub; // Clerk user ID
    } catch {
      return null;
    }
  }

  private async broadcastPresence(userId: string, isOnline: boolean) {
    // Tell all the user's connections about their online status
    this.server.emit('presence_update', {
      userId,
      isOnline,
      timestamp: new Date().toISOString(),
    });
  }

  private async deliverPendingNotifications(client: AuthenticatedSocket, userId: string) {
    // Delivered via REST API on app load — WebSocket is just real-time
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineCount(): number {
    return this.onlineUsers.size;
  }
}
