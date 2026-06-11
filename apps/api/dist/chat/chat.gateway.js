"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma.service");
let ChatGateway = class ChatGateway {
    constructor(prisma) {
        this.prisma = prisma;
        this.userSockets = new Map();
    }
    handleConnection(client) {
        const clerkId = client.handshake.query.clerkId;
        if (clerkId)
            this.userSockets.set(clerkId, client.id);
    }
    handleDisconnect(client) {
        for (const [clerkId, socketId] of this.userSockets) {
            if (socketId === client.id) {
                this.userSockets.delete(clerkId);
                break;
            }
        }
    }
    async joinGroup(data, client) {
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
    async sendGroupMessage(data) {
        const user = await this.prisma.user.findUnique({ where: { clerkId: data.clerkId } });
        if (!user)
            return;
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
    async sendDM(data) {
        const sender = await this.prisma.user.findUnique({ where: { clerkId: data.fromClerkId } });
        const receiver = await this.prisma.user.findUnique({ where: { clerkId: data.toClerkId } });
        if (!sender || !receiver)
            return;
        const connection = await this.prisma.connection.findFirst({
            where: { OR: [{ senderId: sender.id, receiverId: receiver.id }, { senderId: receiver.id, receiverId: sender.id }], status: 'ACCEPTED' },
        });
        if (!connection)
            return;
        let conversation = await this.prisma.conversation.findUnique({ where: { connectionId: connection.id } });
        if (!conversation) {
            conversation = await this.prisma.conversation.create({ data: { connectionId: connection.id, type: 'direct' } });
        }
        const message = await this.prisma.message.create({
            data: { conversationId: conversation.id, senderId: sender.id, content: data.content, type: 'TEXT' },
            include: { sender: { select: { id: true, displayName: true, avatarUrl: true } } },
        });
        const receiverSocketId = this.userSockets.get(data.toClerkId);
        if (receiverSocketId)
            this.server.to(receiverSocketId).emit('newDM', message);
        const senderSocketId = this.userSockets.get(data.fromClerkId);
        if (senderSocketId)
            this.server.to(senderSocketId).emit('newDM', message);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinGroup'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "joinGroup", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendGroupMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendGroupMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendDM'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "sendDM", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: '*' }, namespace: '/chat' }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map