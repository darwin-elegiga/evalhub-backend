import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ExamUpdatedEvent } from '../exam-updated.event';

@EventsHandler(ExamUpdatedEvent)
export class ExamUpdatedHandler implements IEventHandler<ExamUpdatedEvent> {
  private readonly logger = new Logger(ExamUpdatedHandler.name);

  handle(event: ExamUpdatedEvent): void {
    this.logger.log(
      `Exam updated: ${event.examId} by teacher ${event.teacherId}`,
    );
  }
}
