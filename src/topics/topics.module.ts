import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TopicsController } from './topics.controller';
import { PrismaModule } from '../prisma';
import { CommandHandlers } from './commands/handlers';
import { QueryHandlers } from './queries/handlers';
import { EventHandlers } from './events/handlers';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [TopicsController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class TopicsModule {}
