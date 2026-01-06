import { QuestionCreatedHandler } from './question-created.handler';
import { QuestionUpdatedHandler } from './question-updated.handler';
import { QuestionDeletedHandler } from './question-deleted.handler';

export const EventHandlers = [
  QuestionCreatedHandler,
  QuestionUpdatedHandler,
  QuestionDeletedHandler,
];

export {
  QuestionCreatedHandler,
  QuestionUpdatedHandler,
  QuestionDeletedHandler,
};
