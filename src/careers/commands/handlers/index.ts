export * from './create-career.handler';
export * from './update-career.handler';
export * from './delete-career.handler';

import { CreateCareerHandler } from './create-career.handler';
import { UpdateCareerHandler } from './update-career.handler';
import { DeleteCareerHandler } from './delete-career.handler';

export const CommandHandlers = [
  CreateCareerHandler,
  UpdateCareerHandler,
  DeleteCareerHandler,
];
