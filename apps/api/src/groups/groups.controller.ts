import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('groups')
export class GroupsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('city') city?: string) {
    return this.prisma.group.findMany({
      where: city ? { citySlug: city } : {},
      take: 20,
    });
  }
}
