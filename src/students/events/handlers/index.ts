export * from './student-created.handler';
export * from './student-updated.handler';
export * from './student-deleted.handler';

import { StudentCreatedHandler } from './student-created.handler';
import { StudentUpdatedHandler } from './student-updated.handler';
import { StudentDeletedHandler } from './student-deleted.handler';

export const EventHandlers = [
  StudentCreatedHandler,
  StudentUpdatedHandler,
  StudentDeletedHandler,
];
