export * from './get-students.handler';
export * from './get-student-by-id.handler';

import { GetStudentsHandler } from './get-students.handler';
import { GetStudentByIdHandler } from './get-student-by-id.handler';

export const QueryHandlers = [GetStudentsHandler, GetStudentByIdHandler];
