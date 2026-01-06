import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { StudentsController } from './students.controller';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { EventHandlers } from './events';

@Module({
  imports: [CqrsModule],
  controllers: [StudentsController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class StudentsModule {}
