import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DeleteCareerCommand } from '../delete-career.command';
import { PrismaService } from '../../../prisma';
import { CareerDeletedEvent } from '../../events';

@Injectable()
@CommandHandler(DeleteCareerCommand)
export class DeleteCareerHandler
  implements ICommandHandler<DeleteCareerCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteCareerCommand): Promise<void> {
    const { careerId } = command;

    const career = await this.prisma.career.findUnique({
      where: { id: careerId },
    });

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    await this.prisma.career.delete({
      where: { id: careerId },
    });

    this.eventBus.publish(new CareerDeletedEvent(careerId, career.name));
  }
}
