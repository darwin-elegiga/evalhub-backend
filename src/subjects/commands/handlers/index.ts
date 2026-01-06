export * from './create-subject.handler';
export * from './update-subject.handler';
export * from './delete-subject.handler';

import { CreateSubjectHandler } from './create-subject.handler';
import { UpdateSubjectHandler } from './update-subject.handler';
import { DeleteSubjectHandler } from './delete-subject.handler';

export const CommandHandlers = [
  CreateSubjectHandler,
  UpdateSubjectHandler,
  DeleteSubjectHandler,
];
