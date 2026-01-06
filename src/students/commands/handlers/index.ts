export * from './create-student.handler';
export * from './create-students-batch.handler';
export * from './update-student.handler';
export * from './delete-student.handler';

import { CreateStudentHandler } from './create-student.handler';
import { CreateStudentsBatchHandler } from './create-students-batch.handler';
import { UpdateStudentHandler } from './update-student.handler';
import { DeleteStudentHandler } from './delete-student.handler';

export const CommandHandlers = [
  CreateStudentHandler,
  CreateStudentsBatchHandler,
  UpdateStudentHandler,
  DeleteStudentHandler,
];
