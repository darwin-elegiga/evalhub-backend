import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetAssignmentByTokenQuery } from '../get-assignment-by-token.query';
import { PrismaService } from '../../../prisma';
import { TokenResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetAssignmentByTokenQuery)
export class GetAssignmentByTokenHandler implements IQueryHandler<GetAssignmentByTokenQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAssignmentByTokenQuery): Promise<TokenResponseDto> {
    const { token } = query;

    const assignment = await this.prisma.examAssignment.findUnique({
      where: { magicToken: token },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                question: true,
              },
              orderBy: {
                questionOrder: 'asc',
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
          },
        },
        answers: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Invalid exam token');
    }

    // Build questions (typeConfig contains options for multiple_choice without revealing correct answers)
    const questions = assignment.exam.questions.map((eq) => {
      const question = eq.question;

      return {
        id: question.id,
        title: question.title,
        content: question.content,
        questionType: question.questionType,
        typeConfig: question.typeConfig as Record<string, unknown>,
        questionOrder: eq.questionOrder,
        weight: eq.weight,
      };
    });

    // Build answers separately
    const answers = assignment.answers.map((answer) => ({
      id: answer.id,
      assignmentId: answer.assignmentId,
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      answerText: answer.answerText,
      answerLatex: answer.answerLatex,
      answerNumeric: answer.answerNumeric,
      answerPoint: answer.answerPoint as Record<string, unknown> | null,
      score: answer.score,
      feedback: answer.feedback,
      createdAt: answer.createdAt,
    }));

    return {
      assignment: {
        id: assignment.id,
        status: assignment.status,
        startedAt: assignment.startedAt,
        submittedAt: assignment.submittedAt,
      },
      exam: {
        id: assignment.exam.id,
        title: assignment.exam.title,
        description: assignment.exam.description,
        durationMinutes: assignment.exam.durationMinutes,
        config: assignment.exam.config as Record<string, unknown>,
      },
      student: {
        id: assignment.student.id,
        fullName: assignment.student.fullName,
      },
      questions,
      answers,
    };
  }
}
