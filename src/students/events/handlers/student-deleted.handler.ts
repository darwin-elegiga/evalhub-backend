import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { StudentDeletedEvent } from '../student-deleted.event';

@EventsHandler(StudentDeletedEvent)
export class StudentDeletedHandler implements IEventHandler<StudentDeletedEvent> {
  private readonly logger = new Logger(StudentDeletedHandler.name);

  async handle(event: StudentDeletedEvent): Promise<void> {
    this.logger.log(
      `Student deleted: ID ${event.studentId} by teacher ${event.teacherId} at ${event.timestamp.toISOString()}`,
    );
  }
}
