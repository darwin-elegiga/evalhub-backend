import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { TopicCreatedEvent } from '../topic-created.event';

@Injectable()
@EventsHandler(TopicCreatedEvent)
export class TopicCreatedHandler implements IEventHandler<TopicCreatedEvent> {
  private readonly logger = new Logger(TopicCreatedHandler.name);

  handle(event: TopicCreatedEvent): void {
    this.logger.log(
      `Topic created: ${event.name} (ID: ${event.topicId}) in subject ${event.subjectId}`,
    );
  }
}
