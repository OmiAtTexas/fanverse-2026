import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('matches')
export class MatchesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('city') city?: string) {
    return this.prisma.worldCupMatch.findMany({
      where: city ? { citySlug: city } : {},
      orderBy: { kickoffAt: 'asc' },
      take: 50,
    });
  }
}
