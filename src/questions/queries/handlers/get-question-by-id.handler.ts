import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetQuestionByIdQuery } from '../get-question-by-id.query';
import { PrismaService } from '../../../prisma';
import { QuestionResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdHandler
  implements IQueryHandler<GetQuestionByIdQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetQuestionByIdQuery): Promise<QuestionResponseDto> {
    const { questionId, teacherId } = query;

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to view this question',
      );
    }

    return {
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
    };
  }
}
