import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetTopicsQuery } from '../get-topics.query';
import { PrismaService } from '../../../prisma';
import { TopicResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetTopicsQuery)
export class GetTopicsHandler implements IQueryHandler<GetTopicsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTopicsQuery): Promise<TopicResponseDto[]> {
    const { teacherId, subjectId } = query;

    const topics = await this.prisma.topic.findMany({
      where: {
        teacherId,
        ...(subjectId && { subjectId }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return topics.map((topic) => ({
      id: topic.id,
      teacherId: topic.teacherId,
      subjectId: topic.subjectId,
      name: topic.name,
      description: topic.description,
      color: topic.color,
      createdAt: topic.createdAt,
    }));
  }
}
