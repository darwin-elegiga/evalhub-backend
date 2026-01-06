import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetSubjectsQuery } from '../get-subjects.query';
import { PrismaService } from '../../../prisma';
import { SubjectResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetSubjectsQuery)
export class GetSubjectsHandler implements IQueryHandler<GetSubjectsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetSubjectsQuery): Promise<SubjectResponseDto[]> {
    const { teacherId } = query;

    const subjects = await this.prisma.subject.findMany({
      where: { teacherId },
      orderBy: { name: 'asc' },
    });

    return subjects.map((subject) => ({
      id: subject.id,
      name: subject.name,
      description: subject.description,
      color: subject.color,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    }));
  }
}
