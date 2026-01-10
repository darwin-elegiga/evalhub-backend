import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { StudentUpdatedEvent } from '../student-updated.event';

@EventsHandler(StudentUpdatedEvent)
export class StudentUpdatedHandler implements IEventHandler<StudentUpdatedEvent> {
  private readonly logger = new Logger(StudentUpdatedHandler.name);

  async handle(event: StudentUpdatedEvent): Promise<void> {
    this.logger.log(
      `Student updated: ID ${event.studentId} by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
