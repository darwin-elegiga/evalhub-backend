import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { QuestionCreatedEvent } from '../question-created.event';

@EventsHandler(QuestionCreatedEvent)
export class QuestionCreatedHandler
  implements IEventHandler<QuestionCreatedEvent>
{
  private readonly logger = new Logger(QuestionCreatedHandler.name);

  handle(event: QuestionCreatedEvent): void {
    this.logger.log(
      `Question created: ${event.title} (ID: ${event.questionId}) by teacher ${event.teacherId}`,
    );
  }
}
