export * from './get-groups.handler';
export * from './get-group-by-id.handler';

import { GetGroupsHandler } from './get-groups.handler';
import { GetGroupByIdHandler } from './get-group-by-id.handler';

export const QueryHandlers = [GetGroupsHandler, GetGroupByIdHandler];
