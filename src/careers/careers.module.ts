import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CareersController } from './careers.controller';
import { CommandHandlers } from './commands';
import { QueryHandlers } from './queries';
import { EventHandlers } from './events';

@Module({
  imports: [CqrsModule],
  controllers: [CareersController],
  providers: [...CommandHandlers, ...QueryHandlers, ...EventHandlers],
})
export class CareersModule {}
