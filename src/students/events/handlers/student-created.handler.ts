import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { StudentCreatedEvent } from '../student-created.event';

@EventsHandler(StudentCreatedEvent)
export class StudentCreatedHandler
  implements IEventHandler<StudentCreatedEvent>
{
  private readonly logger = new Logger(StudentCreatedHandler.name);

  async handle(event: StudentCreatedEvent): Promise<void> {
    this.logger.log(
      `Student created: ${event.fullName} (ID: ${event.studentId}) by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
