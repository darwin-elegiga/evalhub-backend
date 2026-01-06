import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetExamsQuery } from '../get-exams.query';
import { PrismaService } from '../../../prisma';
import { ExamResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetExamsQuery)
export class GetExamsHandler implements IQueryHandler<GetExamsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetExamsQuery): Promise<ExamResponseDto[]> {
    const { teacherId } = query;

    const exams = await this.prisma.exam.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' },
    });

    return exams.map((exam) => ({
      id: exam.id,
      teacherId: exam.teacherId,
      subjectId: exam.subjectId,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
    }));
  }
}
