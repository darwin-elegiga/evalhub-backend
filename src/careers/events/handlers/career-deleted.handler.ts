import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CareerDeletedEvent } from '../career-deleted.event';

@EventsHandler(CareerDeletedEvent)
export class CareerDeletedHandler implements IEventHandler<CareerDeletedEvent> {
  private readonly logger = new Logger(CareerDeletedHandler.name);

  async handle(event: CareerDeletedEvent): Promise<void> {
    this.logger.log(
      `Career deleted: ${event.name} (ID: ${event.careerId}) at ${event.timestamp.toISOString()}`,
    );
  }
}
