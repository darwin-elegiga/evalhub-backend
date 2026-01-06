import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SubjectCreatedEvent } from '../subject-created.event';

@EventsHandler(SubjectCreatedEvent)
export class SubjectCreatedHandler
  implements IEventHandler<SubjectCreatedEvent>
{
  private readonly logger = new Logger(SubjectCreatedHandler.name);

  async handle(event: SubjectCreatedEvent): Promise<void> {
    this.logger.log(
      `Subject created: ${event.name} (ID: ${event.subjectId}) by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
