export * from './register-user.handler';
export * from './login-user.handler';
export * from './refresh-token.handler';
export * from './logout-user.handler';

import { RegisterUserHandler } from './register-user.handler';
import { LoginUserHandler } from './login-user.handler';
import { RefreshTokenHandler } from './refresh-token.handler';
import { LogoutUserHandler } from './logout-user.handler';

export const CommandHandlers = [
  RegisterUserHandler,
  LoginUserHandler,
  RefreshTokenHandler,
  LogoutUserHandler,
];
