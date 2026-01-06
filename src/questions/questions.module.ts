import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsController } from './questions.controller';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { EventHandlers } from './events';

@Module({
  imports: [CqrsModule],
  controllers: [QuestionsController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class QuestionsModule {}
