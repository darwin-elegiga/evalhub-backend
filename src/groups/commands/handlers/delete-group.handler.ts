import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeleteGroupCommand } from '../delete-group.command';
import { PrismaService } from '../../../prisma';
import { GroupDeletedEvent } from '../../events';

@Injectable()
@CommandHandler(DeleteGroupCommand)
export class DeleteGroupHandler implements ICommandHandler<DeleteGroupCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteGroupCommand): Promise<void> {
    const { groupId, teacherId } = command;

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to delete this group',
      );
    }

    await this.prisma.group.delete({
      where: { id: groupId },
    });

    this.eventBus.publish(new GroupDeletedEvent(groupId, teacherId));
  }
}
