export * from './subject-created.handler';
export * from './subject-updated.handler';
export * from './subject-deleted.handler';

import { SubjectCreatedHandler } from './subject-created.handler';
import { SubjectUpdatedHandler } from './subject-updated.handler';
import { SubjectDeletedHandler } from './subject-deleted.handler';

export const EventHandlers = [
  SubjectCreatedHandler,
  SubjectUpdatedHandler,
  SubjectDeletedHandler,
];
