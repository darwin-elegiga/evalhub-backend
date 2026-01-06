import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SubjectsController } from './subjects.controller';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { EventHandlers } from './events';

@Module({
  imports: [CqrsModule],
  controllers: [SubjectsController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class SubjectsModule {}
