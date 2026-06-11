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
    async search(q, clerkId) {
        if (!q || q.length < 2)
            return [];
        return this.prisma.user.findMany({
            where: {
                OR: [
                    { displayName: { contains: q, mode: 'insensitive' } },
                    { username: { contains: q, mode: 'insensitive' } },
                    { nationality: { contains: q, mode: 'insensitive' } },
                    { supportedTeam: { contains: q, mode: 'insensitive' } },
                ],
                NOT: { clerkId },
            },
            select: {
                id: true, clerkId: true, displayName: true, username: true,
                avatarUrl: true, nationality: true, supportedTeam: true, bio: true,
            },
            take: 20,
        });
    }
    async suggestions(clerkId) {
        return this.prisma.user.findMany({
            where: { NOT: { clerkId: clerkId || 'none' } },
            select: {
                id: true, clerkId: true, displayName: true, username: true,
                avatarUrl: true, nationality: true, supportedTeam: true, bio: true,
            },
            take: 20,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getProfile(id) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true, clerkId: true, displayName: true, username: true,
                avatarUrl: true, nationality: true, supportedTeam: true, bio: true,
            },
        });
    }
    async follow(targetId, clerkId) {
        const me = await this.prisma.user.findUnique({ where: { clerkId } });
        if (!me)
            throw new Error('User not found');
        const existing = await this.prisma.follow.findUnique({
            where: { followerId_followingId: { followerId: me.id, followingId: targetId } },
        });
        if (existing) {
            await this.prisma.follow.delete({
                where: { followerId_followingId: { followerId: me.id, followingId: targetId } },
            });
            return { following: false };
        }
        await this.prisma.follow.create({
            data: { followerId: me.id, followingId: targetId },
        });
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
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
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