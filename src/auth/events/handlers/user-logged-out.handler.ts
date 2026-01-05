import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { UserLoggedOutEvent } from '../user-logged-out.event';

@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutHandler implements IEventHandler<UserLoggedOutEvent> {
  private readonly logger = new Logger(UserLoggedOutHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async handle(event: UserLoggedOutEvent): Promise<void> {
    this.logger.log(
      `User logged out: ${event.userId} at ${event.timestamp.toISOString()}`,
    );

    await this.prisma.authEvent.create({
      data: {
        userId: event.userId,
        eventType: 'USER_LOGGED_OUT',
        metadata: {
          tokenId: event.tokenId,
          timestamp: event.timestamp.toISOString(),
        },
      },
    });
  }
}
