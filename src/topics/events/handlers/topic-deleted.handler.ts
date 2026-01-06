import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { TopicDeletedEvent } from '../topic-deleted.event';

@Injectable()
@EventsHandler(TopicDeletedEvent)
export class TopicDeletedHandler implements IEventHandler<TopicDeletedEvent> {
  private readonly logger = new Logger(TopicDeletedHandler.name);

  handle(event: TopicDeletedEvent): void {
    this.logger.log(
      `Topic deleted: ${event.name} (ID: ${event.topicId})`,
    );
  }
}
