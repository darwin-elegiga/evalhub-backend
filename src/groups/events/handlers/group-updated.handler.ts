import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GroupUpdatedEvent } from '../group-updated.event';

@EventsHandler(GroupUpdatedEvent)
export class GroupUpdatedHandler implements IEventHandler<GroupUpdatedEvent> {
  private readonly logger = new Logger(GroupUpdatedHandler.name);

  async handle(event: GroupUpdatedEvent): Promise<void> {
    this.logger.log(
      `Group updated: ID ${event.groupId} by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
