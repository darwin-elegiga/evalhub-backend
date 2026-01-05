import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { UserRegisteredEvent } from '../user-registered.event';

@EventsHandler(UserRegisteredEvent)
export class UserRegisteredHandler implements IEventHandler<UserRegisteredEvent> {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async handle(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(
      `User registered: ${event.email} (ID: ${event.userId}) at ${event.timestamp.toISOString()}`,
    );

    await this.prisma.authEvent.create({
      data: {
        userId: event.userId,
        eventType: 'USER_REGISTERED',
        metadata: {
          email: event.email,
          firstName: event.firstName,
          lastName: event.lastName,
          timestamp: event.timestamp.toISOString(),
        },
      },
    });
  }
}
