import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async findAll(citySlug?: string, fromDate?: string) {
    return this.prisma.worldCupMatch.findMany({
      where: {
        ...(citySlug ? { citySlug } : {}),
        ...(fromDate ? { kickoffAt: { gte: new Date(fromDate) } } : {}),
      },
      include: { _count: { select: { tickets: true } } },
      orderBy: { kickoffAt: 'asc' },
    });
  }

  async addTicket(userId: string, matchId: string, seatSection?: string) {
    return this.prisma.userTicket.upsert({
      where: { userId_matchId: { userId, matchId } },
      create: { userId, matchId, seatSection },
      update: { seatSection },
    });
  }

  async removeTicket(userId: string, matchId: string) {
    return this.prisma.userTicket.delete({
      where: { userId_matchId: { userId, matchId } },
    });
  }

  async getMyMatches(userId: string) {
    return this.prisma.userTicket.findMany({
      where: { userId },
      include: { match: true },
      orderBy: { match: { kickoffAt: 'asc' } },
    });
  }
}
