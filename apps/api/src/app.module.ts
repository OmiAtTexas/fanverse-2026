import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthController } from './auth/auth.controller';
import { MatchesController } from './matches/matches.controller';
import { GroupsController } from './groups/groups.controller';
import { UsersController } from './users/users.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, AuthController, MatchesController, GroupsController, UsersController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
