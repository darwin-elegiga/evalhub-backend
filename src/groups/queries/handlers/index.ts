export * from './get-groups.handler';
export * from './get-group-by-id.handler';
export * from './get-group-students.handler';

import { GetGroupsHandler } from './get-groups.handler';
import { GetGroupByIdHandler } from './get-group-by-id.handler';
import { GetGroupStudentsHandler } from './get-group-students.handler';

export const QueryHandlers = [
  GetGroupsHandler,
  GetGroupByIdHandler,
  GetGroupStudentsHandler,
];
