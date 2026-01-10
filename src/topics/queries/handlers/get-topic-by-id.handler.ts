import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetTopicByIdQuery } from '../get-topic-by-id.query';
import { PrismaService } from '../../../prisma';
import { TopicResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetTopicByIdQuery)
export class GetTopicByIdHandler implements IQueryHandler<GetTopicByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTopicByIdQuery): Promise<TopicResponseDto> {
    const { topicId, teacherId } = query;

    const topic = await this.prisma.topic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to view this topic',
      );
    }

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
