export * from './group-created.handler';
export * from './group-updated.handler';
export * from './group-deleted.handler';

import { GroupCreatedHandler } from './group-created.handler';
import { GroupUpdatedHandler } from './group-updated.handler';
import { GroupDeletedHandler } from './group-deleted.handler';

export const EventHandlers = [
  GroupCreatedHandler,
  GroupUpdatedHandler,
  GroupDeletedHandler,
];
