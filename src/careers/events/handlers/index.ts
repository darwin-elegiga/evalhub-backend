export * from './career-created.handler';
export * from './career-updated.handler';
export * from './career-deleted.handler';

import { CareerCreatedHandler } from './career-created.handler';
import { CareerUpdatedHandler } from './career-updated.handler';
import { CareerDeletedHandler } from './career-deleted.handler';

export const EventHandlers = [
  CareerCreatedHandler,
  CareerUpdatedHandler,
  CareerDeletedHandler,
];
