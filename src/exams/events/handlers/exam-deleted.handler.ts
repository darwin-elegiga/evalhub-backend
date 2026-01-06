import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ExamDeletedEvent } from '../exam-deleted.event';

@EventsHandler(ExamDeletedEvent)
export class ExamDeletedHandler implements IEventHandler<ExamDeletedEvent> {
  private readonly logger = new Logger(ExamDeletedHandler.name);

  handle(event: ExamDeletedEvent): void {
    this.logger.log(
      `Exam deleted: ${event.examId} by teacher ${event.teacherId}`,
    );
  }
}
