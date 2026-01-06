export * from './create-group.handler';
export * from './update-group.handler';
export * from './delete-group.handler';
export * from './add-students-to-group.handler';
export * from './remove-students-from-group.handler';

import { CreateGroupHandler } from './create-group.handler';
import { UpdateGroupHandler } from './update-group.handler';
import { DeleteGroupHandler } from './delete-group.handler';
import { AddStudentsToGroupHandler } from './add-students-to-group.handler';
import { RemoveStudentsFromGroupHandler } from './remove-students-from-group.handler';

export const CommandHandlers = [
  CreateGroupHandler,
  UpdateGroupHandler,
  DeleteGroupHandler,
  AddStudentsToGroupHandler,
  RemoveStudentsFromGroupHandler,
];
