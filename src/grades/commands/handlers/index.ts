export * from './grade-answer.handler';
export * from './submit-grade.handler';

import { GradeAnswerHandler } from './grade-answer.handler';
import { SubmitGradeHandler } from './submit-grade.handler';

export const CommandHandlers = [GradeAnswerHandler, SubmitGradeHandler];
