import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { QuestionDeletedEvent } from '../question-deleted.event';

@EventsHandler(QuestionDeletedEvent)
export class QuestionDeletedHandler
  implements IEventHandler<QuestionDeletedEvent>
{
  private readonly logger = new Logger(QuestionDeletedHandler.name);

  handle(event: QuestionDeletedEvent): void {
    this.logger.log(
      `Question deleted: ${event.questionId} by teacher ${event.teacherId}`,
    );
  }
}
