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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let MessagesController = class MessagesController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getConversations(clerkId) {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user)
            return [];
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
    async getMessages(conversationId) {
        return this.prisma.message.findMany({
            where: { conversationId },
            include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });
    }
    async sendDM(toClerkId, fromClerkId, body) {
        const sender = await this.prisma.user.findUnique({ where: { clerkId: fromClerkId } });
        const receiver = await this.prisma.user.findUnique({ where: { clerkId: toClerkId } });
        if (!sender || !receiver)
            throw new Error('User not found');
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
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)('dm/:toClerkId'),
    __param(0, (0, common_1.Param)('toClerkId')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], MessagesController.prototype, "sendDM", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map