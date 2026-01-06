import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeleteTopicCommand } from '../delete-topic.command';
import { PrismaService } from '../../../prisma';
import { TopicDeletedEvent } from '../../events';
import { DeleteResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(DeleteTopicCommand)
export class DeleteTopicHandler implements ICommandHandler<DeleteTopicCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteTopicCommand): Promise<DeleteResponseDto> {
    const { topicId, teacherId } = command;

    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to delete this topic',
      );
    }

    await this.prisma.topic.delete({
      where: { id: topicId },
    });

    this.eventBus.publish(
      new TopicDeletedEvent(topicId, teacherId, topic.subjectId, topic.name),
    );

    return { success: true };
  }
}
