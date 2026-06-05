import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        passport: { include: { stamps: true } },
        tickets: { include: { match: true } },
        _count: { select: { connections: true, groupMembers: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(clerkId: string, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { clerkId },
      data: {
        ...dto,
        interests: dto.interests ?? undefined,
        languages: dto.languages ?? undefined,
        visitingCities: dto.visitingCities ?? undefined,
      },
    });
  }

  async updateEmbedding(userId: string, embedding: number[]) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { embedding },
    });
  }

  async getNearbyFans(citySlug: string, excludeUserId: string, limit = 20) {
    return this.prisma.user.findMany({
      where: {
        visitingCities: { has: citySlug },
        id: { not: excludeUserId },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        nationality: true,
        supportedTeam: true,
        languages: true,
        interests: true,
        bio: true,
      },
      take: limit,
    });
  }

  async updateLastActive(clerkId: string) {
    return this.prisma.user.update({
      where: { clerkId },
      data: { lastActiveAt: new Date() },
    });
  }
}
