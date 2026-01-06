import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ExamCreatedEvent } from '../exam-created.event';

@EventsHandler(ExamCreatedEvent)
export class ExamCreatedHandler implements IEventHandler<ExamCreatedEvent> {
  private readonly logger = new Logger(ExamCreatedHandler.name);

  handle(event: ExamCreatedEvent): void {
    this.logger.log(
      `Exam created: ${event.title} (ID: ${event.examId}) by teacher ${event.teacherId}`,
    );
  }
}
