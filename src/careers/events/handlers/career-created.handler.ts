import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CareerCreatedEvent } from '../career-created.event';

@EventsHandler(CareerCreatedEvent)
export class CareerCreatedHandler implements IEventHandler<CareerCreatedEvent> {
  private readonly logger = new Logger(CareerCreatedHandler.name);

  async handle(event: CareerCreatedEvent): Promise<void> {
    this.logger.log(
      `Career created: ${event.name} (ID: ${event.careerId}) at ${event.timestamp.toISOString()}`,
    );
  }
}
