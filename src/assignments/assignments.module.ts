import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../prisma';
import { AssignmentsController } from './assignments.controller';

import {
  StartAssignmentHandler,
  SaveAnswerHandler,
  SubmitAssignmentHandler,
} from './commands';

import {
  GetAssignmentsHandler,
  GetAssignmentByIdHandler,
  GetAssignmentGradingHandler,
  GetAssignmentByTokenHandler,
} from './queries';

const CommandHandlers = [
  StartAssignmentHandler,
  SaveAnswerHandler,
  SubmitAssignmentHandler,
];

const QueryHandlers = [
  GetAssignmentsHandler,
  GetAssignmentByIdHandler,
  GetAssignmentGradingHandler,
  GetAssignmentByTokenHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [AssignmentsController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class AssignmentsModule {}
