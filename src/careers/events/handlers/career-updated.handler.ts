import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CareerUpdatedEvent } from '../career-updated.event';

@EventsHandler(CareerUpdatedEvent)
export class CareerUpdatedHandler implements IEventHandler<CareerUpdatedEvent> {
  private readonly logger = new Logger(CareerUpdatedHandler.name);

  async handle(event: CareerUpdatedEvent): Promise<void> {
    this.logger.log(
      `Career updated: ID ${event.careerId} at ${event.timestamp.toISOString()}`,
    );
  }
}
