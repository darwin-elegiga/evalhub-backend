import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetExamByIdQuery } from '../get-exam-by-id.query';
import { PrismaService } from '../../../prisma';
import { ExamDetailResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetExamByIdQuery)
export class GetExamByIdHandler implements IQueryHandler<GetExamByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetExamByIdQuery): Promise<ExamDetailResponseDto> {
    const { examId, teacherId } = query;

    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { questionOrder: 'asc' },
          include: { question: true },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to view this exam',
      );
    }

    const configData = exam.config as Record<string, unknown>;

    return {
      id: exam.id,
      teacherId: exam.teacherId,
      subjectId: exam.subjectId,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      createdAt: exam.createdAt,
      updatedAt: exam.updatedAt,
      config: {
        shuffleQuestions: (configData.shuffleQuestions as boolean) ?? false,
        shuffleOptions: (configData.shuffleOptions as boolean) ?? false,
        showResultsImmediately:
          (configData.showResultsImmediately as boolean) ?? true,
        allowReview: (configData.allowReview as boolean) ?? true,
        penaltyPerWrongAnswer:
          (configData.penaltyPerWrongAnswer as number) ?? null,
        passingPercentage: (configData.passingPercentage as number) ?? 60,
      },
      questions: exam.questions.map((eq) => ({
        id: eq.id,
        examId: eq.examId,
        questionId: eq.questionId,
        questionOrder: eq.questionOrder,
        weight: eq.weight,
        question: eq.question as unknown as Record<string, unknown>,
      })),
    };
  }
}
