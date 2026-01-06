import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { QuestionUpdatedEvent } from '../question-updated.event';

@EventsHandler(QuestionUpdatedEvent)
export class QuestionUpdatedHandler
  implements IEventHandler<QuestionUpdatedEvent>
{
  private readonly logger = new Logger(QuestionUpdatedHandler.name);

  handle(event: QuestionUpdatedEvent): void {
    this.logger.log(
      `Question updated: ${event.questionId} by teacher ${event.teacherId}`,
    );
  }
}
