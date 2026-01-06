import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { GroupsController } from './groups.controller';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { EventHandlers } from './events';

@Module({
  imports: [CqrsModule],
  controllers: [GroupsController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class GroupsModule {}
