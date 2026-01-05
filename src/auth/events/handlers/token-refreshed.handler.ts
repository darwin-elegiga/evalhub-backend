import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma';
import { TokenRefreshedEvent } from '../token-refreshed.event';

@EventsHandler(TokenRefreshedEvent)
export class TokenRefreshedHandler implements IEventHandler<TokenRefreshedEvent> {
  private readonly logger = new Logger(TokenRefreshedHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async handle(event: TokenRefreshedEvent): Promise<void> {
    this.logger.log(
      `Token refreshed for user: ${event.userId} at ${event.timestamp.toISOString()}`,
    );

    await this.prisma.authEvent.create({
      data: {
        userId: event.userId,
        eventType: 'TOKEN_REFRESHED',
        metadata: {
          oldTokenId: event.oldTokenId,
          newTokenId: event.newTokenId,
          timestamp: event.timestamp.toISOString(),
        },
      },
    });
  }
}
