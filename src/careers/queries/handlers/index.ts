export * from './get-careers.handler';
export * from './get-career-by-id.handler';

import { GetCareersHandler } from './get-careers.handler';
import { GetCareerByIdHandler } from './get-career-by-id.handler';

export const QueryHandlers = [GetCareersHandler, GetCareerByIdHandler];
