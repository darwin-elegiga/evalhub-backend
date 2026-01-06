import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ExamAssignedEvent } from '../exam-assigned.event';

@EventsHandler(ExamAssignedEvent)
export class ExamAssignedHandler implements IEventHandler<ExamAssignedEvent> {
  private readonly logger = new Logger(ExamAssignedHandler.name);

  handle(event: ExamAssignedEvent): void {
    this.logger.log(
      `Exam ${event.examId} assigned to ${event.studentCount} students by teacher ${event.teacherId}`,
    );
  }
}
