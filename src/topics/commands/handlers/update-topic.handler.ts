import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UpdateTopicCommand } from '../update-topic.command';
import { PrismaService } from '../../../prisma';
import { TopicUpdatedEvent } from '../../events';
import { TopicResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(UpdateTopicCommand)
export class UpdateTopicHandler implements ICommandHandler<UpdateTopicCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateTopicCommand): Promise<TopicResponseDto> {
    const { topicId, teacherId, name, description, color, subjectId } = command;

    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to update this topic',
      );
    }

    // If changing subject, verify the new subject exists and belongs to teacher
    const finalSubjectId = subjectId ?? topic.subjectId;
    if (subjectId && subjectId !== topic.subjectId) {
      const newSubject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });

      if (!newSubject) {
        throw new NotFoundException('Subject not found');
      }

      if (newSubject.teacherId !== teacherId) {
        throw new ForbiddenException(
          'You do not have permission to move topic to this subject',
        );
      }
    }

    // Check for duplicate name in the new subject
    const finalName = name ?? topic.name;
    if (name || subjectId) {
      const existingTopic = await this.prisma.topic.findUnique({
        where: {
          teacherId_subjectId_name: {
            teacherId,
            subjectId: finalSubjectId,
            name: finalName,
          },
        },
      });

      if (existingTopic && existingTopic.id !== topicId) {
        throw new ConflictException(
          'Topic with this name already exists in the subject',
        );
      }
    }

    const updatedTopic = await this.prisma.topic.update({
      where: { id: topicId },
      data: {
        name,
        description,
        color,
        subjectId,
      },
    });

    this.eventBus.publish(
      new TopicUpdatedEvent(
        topicId,
        teacherId,
        updatedTopic.subjectId,
        updatedTopic.name,
      ),
    );

    return {
      id: updatedTopic.id,
      teacherId: updatedTopic.teacherId,
      subjectId: updatedTopic.subjectId,
      name: updatedTopic.name,
      description: updatedTopic.description,
      color: updatedTopic.color,
      createdAt: updatedTopic.createdAt,
    };
  }
}
