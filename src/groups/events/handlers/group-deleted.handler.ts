import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GroupDeletedEvent } from '../group-deleted.event';

@EventsHandler(GroupDeletedEvent)
export class GroupDeletedHandler implements IEventHandler<GroupDeletedEvent> {
  private readonly logger = new Logger(GroupDeletedHandler.name);

  async handle(event: GroupDeletedEvent): Promise<void> {
    this.logger.log(
      `Group deleted: ID ${event.groupId} by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
