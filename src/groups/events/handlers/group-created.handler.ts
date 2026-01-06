import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GroupCreatedEvent } from '../group-created.event';

@EventsHandler(GroupCreatedEvent)
export class GroupCreatedHandler implements IEventHandler<GroupCreatedEvent> {
  private readonly logger = new Logger(GroupCreatedHandler.name);

  async handle(event: GroupCreatedEvent): Promise<void> {
    this.logger.log(
      `Group created: ${event.name} (ID: ${event.groupId}) by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
