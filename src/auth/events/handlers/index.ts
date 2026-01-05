export * from './user-registered.handler';
export * from './user-logged-in.handler';
export * from './token-refreshed.handler';
export * from './user-logged-out.handler';

import { UserRegisteredHandler } from './user-registered.handler';
import { UserLoggedInHandler } from './user-logged-in.handler';
import { TokenRefreshedHandler } from './token-refreshed.handler';
import { UserLoggedOutHandler } from './user-logged-out.handler';

export const EventHandlers = [
  UserRegisteredHandler,
  UserLoggedInHandler,
  TokenRefreshedHandler,
  UserLoggedOutHandler,
];
