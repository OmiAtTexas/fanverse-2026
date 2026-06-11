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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let UsersController = class UsersController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUsersWithStatus(users, meId) {
        const myFollows = await this.prisma.follow.findMany({ where: { followerId: meId } });
        const myRequests = await this.prisma.followRequest.findMany({ where: { fromId: meId } });
        const theirFollows = await this.prisma.follow.findMany({ where: { followerId: { in: users.map(u => u.id) }, followingId: meId } });
        return users.map(u => ({
            ...u,
            followStatus: myFollows.find(f => f.followingId === u.id) ? 'following'
                : myRequests.find(r => r.toId === u.id)?.status === 'PENDING' ? 'requested'
                    : 'none',
            followsMe: !!theirFollows.find(f => f.followerId === u.id),
            canChat: !!myFollows.find(f => f.followingId === u.id) && !!theirFollows.find(f => f.followerId === u.id),
        }));
    }
    async search(q, clerkId) {
        if (!q || q.length < 2)
            return [];
        const me = await this.prisma.user.findUnique({ where: { clerkId } });
        const users = await this.prisma.user.findMany({
            where: { OR: [{ displayName: { contains: q, mode: 'insensitive' } }, { username: { contains: q, mode: 'insensitive' } }, { nationality: { contains: q, mode: 'insensitive' } }, { supportedTeam: { contains: q, mode: 'insensitive' } }], NOT: { clerkId: clerkId || 'none' } },
            select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, _count: { select: { followers: true, following: true } } },
            take: 20,
        });
        return me ? this.getUsersWithStatus(users, me.id) : users;
    }
    async suggestions(clerkId) {
        const me = await this.prisma.user.findUnique({ where: { clerkId } });
        const users = await this.prisma.user.findMany({
            where: { NOT: { clerkId: clerkId || 'none' } },
            select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, _count: { select: { followers: true, following: true } } },
            take: 20,
            orderBy: { createdAt: 'desc' },
        });
        return me ? this.getUsersWithStatus(users, me.id) : users;
    }
    async getFollowRequests(clerkId) {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user)
            return [];
        return this.prisma.followRequest.findMany({
            where: { toId: user.id, status: 'PENDING' },
            include: { from: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, nationality: true, supportedTeam: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async sendFollowRequest(targetId, clerkId) {
        const me = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!me)
            throw new Error('User not found');
        const existing = await this.prisma.followRequest.findFirst({ where: { fromId: me.id, toId: targetId } });
        if (existing)
            return { message: 'Request already sent', status: existing.status };
        return this.prisma.followRequest.create({ data: { fromId: me.id, toId: targetId, status: 'PENDING' } });
    }
    async acceptFollowRequest(requestId, clerkId) {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user)
            throw new Error('User not found');
        const request = await this.prisma.followRequest.findUnique({ where: { id: requestId } });
        if (!request)
            throw new Error('Request not found');
        await this.prisma.followRequest.update({ where: { id: requestId }, data: { status: 'ACCEPTED' } });
        await this.prisma.follow.create({ data: { followerId: request.fromId, followingId: user.id } });
        return { success: true };
    }
    async declineFollowRequest(requestId, clerkId) {
        await this.prisma.followRequest.update({ where: { id: requestId }, data: { status: 'DECLINED' } });
        return { success: true };
    }
    async getConnections(clerkId) {
        const user = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!user)
            return [];
        return this.prisma.connection.findMany({
            where: { OR: [{ senderId: user.id }, { receiverId: user.id }], status: 'ACCEPTED' },
            include: {
                sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, supportedTeam: true } },
                receiver: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, supportedTeam: true } },
            },
        });
    }
    async getConnection(id) {
        return this.prisma.connection.findUnique({
            where: { id },
            include: {
                sender: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, nationality: true, supportedTeam: true } },
                receiver: { select: { id: true, clerkId: true, displayName: true, avatarUrl: true, nationality: true, supportedTeam: true } },
            },
        });
    }
    async getProfile(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: { id: true, clerkId: true, displayName: true, username: true, avatarUrl: true, nationality: true, supportedTeam: true, bio: true, _count: { select: { followers: true, following: true } } },
        });
    }
    async updateMe(clerkId, body) {
        return this.prisma.user.update({
            where: { clerkId },
            data: { nationality: body.nationality, supportedTeam: body.supportedTeam, bio: body.bio, interests: body.interests || [], hostCities: body.hostCities || [] },
        });
    }
    async follow(targetId, clerkId) {
        const me = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!me)
            throw new Error('User not found');
        const existing = await this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId: me.id, followingId: targetId } } });
        if (existing) {
            await this.prisma.follow.delete({ where: { followerId_followingId: { followerId: me.id, followingId: targetId } } });
            return { following: false };
        }
        await this.prisma.follow.create({ data: { followerId: me.id, followingId: targetId } });
        return { following: true };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('suggestions'),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "suggestions", null);
__decorate([
    (0, common_1.Get)('follow-requests'),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFollowRequests", null);
__decorate([
    (0, common_1.Post)(':id/follow-request'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendFollowRequest", null);
__decorate([
    (0, common_1.Post)('follow-requests/:id/accept'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "acceptFollowRequest", null);
__decorate([
    (0, common_1.Post)('follow-requests/:id/decline'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "declineFollowRequest", null);
__decorate([
    (0, common_1.Get)('connections'),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getConnections", null);
__decorate([
    (0, common_1.Get)('connections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getConnection", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('me'),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, common_1.Post)(':id/follow'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "follow", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersController);
//# sourceMappingURL=users.controller.js.map