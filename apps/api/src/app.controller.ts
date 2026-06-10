import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  async health() {
    const userCount = await this.prisma.user.count();
    return { status: 'ok', users: userCount, timestamp: new Date() };
  }
}
