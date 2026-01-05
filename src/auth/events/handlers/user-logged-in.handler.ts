import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { UserLoggedInEvent } from '../user-logged-in.event';

@EventsHandler(UserLoggedInEvent)
export class UserLoggedInHandler implements IEventHandler<UserLoggedInEvent> {
  private readonly logger = new Logger(UserLoggedInHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async handle(event: UserLoggedInEvent): Promise<void> {
    this.logger.log(
      `User logged in: ${event.email} (ID: ${event.userId}) at ${event.timestamp.toISOString()}`,
    );

    await this.prisma.authEvent.create({
      data: {
        userId: event.userId,
        eventType: 'USER_LOGGED_IN',
        metadata: {
          email: event.email,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          timestamp: event.timestamp.toISOString(),
        },
      },
    });
  }
}
