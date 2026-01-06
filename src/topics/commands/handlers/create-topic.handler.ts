import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateTopicCommand } from '../create-topic.command';
import { PrismaService } from '../../../prisma';
import { TopicCreatedEvent } from '../../events';
import { TopicResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(CreateTopicCommand)
export class CreateTopicHandler implements ICommandHandler<CreateTopicCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateTopicCommand): Promise<TopicResponseDto> {
    const { teacherId, subjectId, name, description, color } = command;

    // Verify the subject exists and belongs to the teacher
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (subject.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to add topics to this subject',
      );
    }

    // Check for duplicate topic name in the same subject for this teacher
    const existingTopic = await this.prisma.topic.findUnique({
      where: {
        teacherId_subjectId_name: {
          teacherId,
          subjectId,
          name,
        },
      },
    });

    if (existingTopic) {
      throw new ConflictException('Topic already exists in this subject');
    }

    const topic = await this.prisma.topic.create({
      data: {
        teacherId,
        subjectId,
        name,
        description,
        color,
      },
    });

    this.eventBus.publish(
      new TopicCreatedEvent(topic.id, teacherId, subjectId, name),
    );

    return {
      id: topic.id,
      teacherId: topic.teacherId,
      subjectId: topic.subjectId,
      name: topic.name,
      description: topic.description,
      color: topic.color,
      createdAt: topic.createdAt,
    };
  }
}
