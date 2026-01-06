import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ExamsController } from './exams.controller';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { EventHandlers } from './events';

@Module({
  imports: [CqrsModule],
  controllers: [ExamsController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class ExamsModule {}
