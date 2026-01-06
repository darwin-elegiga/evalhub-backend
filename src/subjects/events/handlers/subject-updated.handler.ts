import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SubjectUpdatedEvent } from '../subject-updated.event';

@EventsHandler(SubjectUpdatedEvent)
export class SubjectUpdatedHandler
  implements IEventHandler<SubjectUpdatedEvent>
{
  private readonly logger = new Logger(SubjectUpdatedHandler.name);

  async handle(event: SubjectUpdatedEvent): Promise<void> {
    this.logger.log(
      `Subject updated: ID ${event.subjectId} by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
