import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { TopicUpdatedEvent } from '../topic-updated.event';

@Injectable()
@EventsHandler(TopicUpdatedEvent)
export class TopicUpdatedHandler implements IEventHandler<TopicUpdatedEvent> {
  private readonly logger = new Logger(TopicUpdatedHandler.name);

  handle(event: TopicUpdatedEvent): void {
    this.logger.log(`Topic updated: ${event.name} (ID: ${event.topicId})`);
  }
}
