export * from './validate-token.handler';
export * from './get-current-user.handler';

import { ValidateTokenHandler } from './validate-token.handler';
import { GetCurrentUserHandler } from './get-current-user.handler';

export const QueryHandlers = [ValidateTokenHandler, GetCurrentUserHandler];
