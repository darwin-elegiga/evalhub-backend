import { CreateExamHandler } from './create-exam.handler';
import { UpdateExamHandler } from './update-exam.handler';
import { DeleteExamHandler } from './delete-exam.handler';
import { AssignExamHandler } from './assign-exam.handler';

export const CommandHandlers = [
  CreateExamHandler,
  UpdateExamHandler,
  DeleteExamHandler,
  AssignExamHandler,
];

export {
  CreateExamHandler,
  UpdateExamHandler,
  DeleteExamHandler,
  AssignExamHandler,
};
