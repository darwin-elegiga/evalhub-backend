export * from './get-subjects.handler';
export * from './get-subject-by-id.handler';

import { GetSubjectsHandler } from './get-subjects.handler';
import { GetSubjectByIdHandler } from './get-subject-by-id.handler';

export const QueryHandlers = [GetSubjectsHandler, GetSubjectByIdHandler];
