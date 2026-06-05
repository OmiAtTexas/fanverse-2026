import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MatchingModule } from './modules/matching/matching.module';
import { GroupsModule } from './modules/groups/groups.module';
import { ChatModule } from './modules/chat/chat.module';
import { TravelModule } from './modules/travel/travel.module';
import { MeetupsModule } from './modules/meetups/meetups.module';
import { PassportModule } from './modules/passport/passport.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MatchesModule } from './modules/matches/matches.module';
import { ModerationModule } from './modules/moderation/moderation.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // Rate limiting
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Cron jobs
    ScheduleModule.forRoot(),

    // Queue (BullMQ / Redis)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get('REDIS_PASSWORD'),
        },
      }),
    }),

    // Core
    PrismaModule,

    // Feature modules
    AuthModule,
    UsersModule,
    MatchingModule,
    GroupsModule,
    ChatModule,
    TravelModule,
    MeetupsModule,
    PassportModule,
    NotificationsModule,
    MatchesModule,
    ModerationModule,
  ],
})
export class AppModule {}
