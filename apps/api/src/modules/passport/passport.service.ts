import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class PassportService {
  constructor(private prisma: PrismaService) {}

  async getMyPassport(userId: string) {
    let passport = await this.prisma.passport.findUnique({
      where: { userId },
      include: { stamps: { orderBy: { earnedAt: 'desc' } } },
    });

    if (!passport) {
      passport = await this.prisma.passport.create({
        data: { userId },
        include: { stamps: true },
      });
    }

    const stats = {
      matches: passport.stamps.filter((s) => s.type === 'MATCH_ATTENDED').length,
      cities: passport.stamps.filter((s) => s.type === 'CITY_VISITED').length,
      fans: passport.stamps.filter((s) => s.type === 'FAN_MET').length,
      meetups: passport.stamps.filter((s) => s.type === 'MEETUP_ATTENDED').length,
    };

    return { ...passport, stats };
  }

  async awardStamp(userId: string, type: string, title: string, metadata?: object) {
    const passport = await this.prisma.passport.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    return this.prisma.stamp.create({
      data: { passportId: passport.id, type, title, metadata },
    });
  }
}
