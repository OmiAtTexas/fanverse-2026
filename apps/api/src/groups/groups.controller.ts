import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('groups')
export class GroupsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async findAll(@Query('city') city?: string, @Query('search') search?: string) {
    return this.prisma.group.findMany({
      where: {
        ...(city ? { citySlug: city } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' as any } } : {}),
      },
      include: { _count: { select: { members: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post()
  async create(
    @Headers('x-user-id') clerkId: string,
    @Body() body: { name: string; description: string; citySlug: string }
  ) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const slug = body.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    return this.prisma.group.create({
      data: {
        name: body.name,
        description: body.description,
        citySlug: body.citySlug,
        slug,
        owner: { connect: { id: user.id } },
      },
    });
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    const existing = await this.prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });
    if (existing) return { message: 'Already a member' };
    return this.prisma.groupMember.create({
      data: { groupId: id, userId: user.id },
    });
  }

  @Post(':id/leave')
  async leave(@Param('id') id: string, @Headers('x-user-id') clerkId: string) {
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) throw new Error('User not found');
    return this.prisma.groupMember.delete({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });
  }
}
