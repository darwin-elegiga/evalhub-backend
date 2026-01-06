import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetQuestionsQuery } from '../get-questions.query';
import { PrismaService } from '../../../prisma';
import { QuestionResponseDto } from '../../dtos';
import { Prisma } from '@prisma/client';

@Injectable()
@QueryHandler(GetQuestionsQuery)
export class GetQuestionsHandler implements IQueryHandler<GetQuestionsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetQuestionsQuery): Promise<QuestionResponseDto[]> {
    const { teacherId, subjectId, topicId, type, difficulty } = query;

    const where: Prisma.QuestionWhereInput = {
      teacherId,
    };

    if (subjectId) {
      where.subjectId = subjectId;
    }

    if (topicId) {
      where.topicId = topicId;
    }

    if (type) {
      where.questionType = type as Prisma.EnumQuestionTypeFilter['equals'];
    }

    if (difficulty) {
      where.difficulty = difficulty as Prisma.EnumDifficultyFilter['equals'];
    }

    const questions = await this.prisma.question.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return questions.map((question) => ({
      id: question.id,
      teacherId: question.teacherId,
      subjectId: question.subjectId,
      topicId: question.topicId,
      title: question.title,
      content: question.content,
      questionType: question.questionType,
      typeConfig: question.typeConfig as Record<string, unknown>,
      difficulty: question.difficulty,
      estimatedTimeMinutes: question.estimatedTimeMinutes,
      tags: question.tags,
      weight: question.weight,
      timesUsed: question.timesUsed,
      averageScore: question.averageScore,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    }));
  }
}
