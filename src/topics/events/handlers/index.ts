import { TopicCreatedHandler } from './topic-created.handler';
import { TopicUpdatedHandler } from './topic-updated.handler';
import { TopicDeletedHandler } from './topic-deleted.handler';

export const EventHandlers = [
  TopicCreatedHandler,
  TopicUpdatedHandler,
  TopicDeletedHandler,
];
