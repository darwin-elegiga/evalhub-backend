import { CreateTopicHandler } from './create-topic.handler';
import { UpdateTopicHandler } from './update-topic.handler';
import { DeleteTopicHandler } from './delete-topic.handler';

export const CommandHandlers = [
  CreateTopicHandler,
  UpdateTopicHandler,
  DeleteTopicHandler,
];
