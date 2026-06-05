import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ModerationModule } from '../moderation/moderation.module';

@Module({
  imports: [ModerationModule],
  providers: [ChatGateway],
})
export class ChatModule {}
