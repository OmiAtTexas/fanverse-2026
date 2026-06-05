import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async findAll(citySlug?: string, limit = 20, offset = 0) {
    const where = citySlug ? { citySlug } : {};
    return this.prisma.group.findMany({
      where,
      include: {
        _count: { select: { members: true } },
        members: {
          take: 3,
          include: { user: { select: { avatarUrl: true } } },
        },
      },
      orderBy: { memberCount: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        members: { include: { user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true, nationality: true, supportedTeam: true } } } },
        _count: { select: { members: true } },
      },
    });
    if (!group) throw new NotFoundException('Group not found');
    return group;
  }

  async create(userId: string, data: { name: string; description: string; citySlug: string; teamFocus?: string; imageUrl?: string }) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: { ...data, createdById: userId },
      });
      await tx.groupMember.create({
        data: { groupId: group.id, userId, role: 'ADMIN' },
      });
      await tx.group.update({ where: { id: group.id }, data: { memberCount: 1 } });
      return group;
    });
  }

  async join(groupId: string, userId: string) {
    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (existing) return existing;

    const [member] = await this.prisma.$transaction([
      this.prisma.groupMember.create({ data: { groupId, userId } }),
      this.prisma.group.update({ where: { id: groupId }, data: { memberCount: { increment: 1 } } }),
    ]);
    return member;
  }

  async leave(groupId: string, userId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId } },
    });
    if (!member) throw new NotFoundException('Not a member');
    if (member.role === 'ADMIN') throw new ForbiddenException('Admin cannot leave. Transfer ownership first.');

    await this.prisma.$transaction([
      this.prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId } } }),
      this.prisma.group.update({ where: { id: groupId }, data: { memberCount: { decrement: 1 } } }),
    ]);
    return { success: true };
  }

  async getMessages(groupId: string, limit = 50, before?: string) {
    return this.prisma.message.findMany({
      where: {
        conversation: { groupId },
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      include: { sender: { select: { id: true, firstName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
