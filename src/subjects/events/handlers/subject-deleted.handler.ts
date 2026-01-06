import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { SubjectDeletedEvent } from '../subject-deleted.event';

@EventsHandler(SubjectDeletedEvent)
export class SubjectDeletedHandler
  implements IEventHandler<SubjectDeletedEvent>
{
  private readonly logger = new Logger(SubjectDeletedHandler.name);

  async handle(event: SubjectDeletedEvent): Promise<void> {
    this.logger.log(
      `Subject deleted: ${event.name} (ID: ${event.subjectId}) by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
