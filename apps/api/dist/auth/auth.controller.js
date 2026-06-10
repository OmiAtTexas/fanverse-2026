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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let AuthController = class AuthController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async syncUser(clerkId, email, name) {
        if (!clerkId)
            throw new common_1.UnauthorizedException();
        const [firstName, ...rest] = (name || '').split(' ');
        const user = await this.prisma.user.upsert({
            where: { clerkId },
            create: { clerkId, email: email || '', username: clerkId, displayName: name || clerkId },
            update: { email: email || '', lastActiveAt: new Date() },
        });
        return user;
    }
    async getMe(clerkId) {
        if (!clerkId)
            throw new common_1.UnauthorizedException();
        return this.prisma.user.findUnique({ where: { clerkId } });
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __param(1, (0, common_1.Headers)('x-user-email')),
    __param(2, (0, common_1.Headers)('x-user-name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "syncUser", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Headers)('x-user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getMe", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map