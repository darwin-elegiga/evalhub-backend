import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from '../prisma';
import { GradesController } from './grades.controller';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [GradesController],
  providers: [...CommandHandlers, ...QueryHandlers],
})
export class GradesModule {}
