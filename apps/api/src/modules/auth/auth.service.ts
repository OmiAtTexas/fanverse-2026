import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private prisma: PrismaService) {}

  async syncUser(clerkId: string) {
    try {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses[0]?.emailAddress;

      const user = await this.prisma.user.upsert({
        where: { clerkId },
        create: {
          clerkId,
          email,
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          avatarUrl: clerkUser.imageUrl,
        },
        update: {
          email,
          firstName: clerkUser.firstName || undefined,
          lastName: clerkUser.lastName || undefined,
          avatarUrl: clerkUser.imageUrl,
          lastActiveAt: new Date(),
        },
      });

      return user;
    } catch (error) {
      this.logger.error('Failed to sync user from Clerk', error);
      throw error;
    }
  }

  async getMe(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
      include: {
        passport: { include: { stamps: true } },
        _count: { select: { connections: true, groupMembers: true } },
      },
    });
  }
}
