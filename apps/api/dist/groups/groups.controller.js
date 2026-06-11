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
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let GroupsController = class GroupsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(city, search) {
        return this.prisma.group.findMany({
            where: {
                ...(city ? { citySlug: city } : {}),
                ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
            },
            include: { _count: { select: { members: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        return this.prisma.group.findUnique({
            where: { id },
            include: { _count: { select: { members: true } } },
        });
    }
    async getMessages(id) {
        let conversation = await this.prisma.conversation.findFirst({ where: { groupId: id } });
        if (!conversation)
            return [];
        return this.prisma.message.findMany({
            where: { conversationId: conversation.id },
            include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });
    }
    async sendMessage(id, clerkId, body) {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user)
            throw new Error('User not found');
        let conversation = await this.prisma.conversation.findFirst({ where: { groupId: id } });
        if (!conversation) {
            conversation = await this.prisma.conversation.create({ data: { groupId: id, type: 'group' } });
        }
        return this.prisma.message.create({
            data: { conversationId: conversation.id, senderId: user.id, content: body.content, type: 'TEXT' },
            include: { sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true } } },
        });
    }
    async create(clerkId, body) {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user)
            throw new Error('User not found');
        const slug = body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        return this.prisma.group.create({
            data: { name: body.name, description: body.description, citySlug: body.citySlug, slug, owner: { connect: { id: user.id } } },
        });
    }
    async join(id, clerkId) {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user)
            throw new Error('User not found');
        const existing = await this.prisma.groupMember.findUnique({
            where: { groupId_userId: { groupId: id, userId: user.id } },
        });
        if (existing)
            return { message: 'Already a member' };
        return this.prisma.groupMember.create({ data: { groupId: id, userId: user.id } });
    }
    async leave(id, clerkId) {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user)
            throw new Error('User not found');
        return this.prisma.groupMember.delete({
            where: { groupId_userId: { groupId: id, userId: user.id } },
        });
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('city')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "join", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "leave", null);
exports.GroupsController = GroupsController = __decorate([
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map