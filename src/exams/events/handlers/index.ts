import { ExamCreatedHandler } from './exam-created.handler';
import { ExamUpdatedHandler } from './exam-updated.handler';
import { ExamDeletedHandler } from './exam-deleted.handler';
import { ExamAssignedHandler } from './exam-assigned.handler';

export const EventHandlers = [
  ExamCreatedHandler,
  ExamUpdatedHandler,
  ExamDeletedHandler,
  ExamAssignedHandler,
];

export {
  ExamCreatedHandler,
  ExamUpdatedHandler,
  ExamDeletedHandler,
  ExamAssignedHandler,
};
