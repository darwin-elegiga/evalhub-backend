import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LogoutUserCommand } from '../logout-user.command';
import { PrismaService } from '../../../prisma';
import { UserLoggedOutEvent } from '../../events';

@Injectable()
@CommandHandler(LogoutUserCommand)
export class LogoutUserHandler implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: LogoutUserCommand): Promise<void> {
    const { userId, refreshToken } = command;

    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        userId,
        isRevoked: false,
      },
    });

    if (!storedToken) {
      throw new NotFoundException('Refresh token not found');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    this.eventBus.publish(new UserLoggedOutEvent(userId, storedToken.id));
  }
}
