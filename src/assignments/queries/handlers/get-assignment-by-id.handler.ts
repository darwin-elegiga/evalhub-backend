import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetAssignmentByIdQuery } from '../get-assignment-by-id.query';
import { PrismaService } from '../../../prisma';
import { AssignmentDetailResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetAssignmentByIdQuery)
export class GetAssignmentByIdHandler
  implements IQueryHandler<GetAssignmentByIdQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    query: GetAssignmentByIdQuery,
  ): Promise<AssignmentDetailResponseDto> {
    const { assignmentId, teacherId } = query;

    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            teacherId: true,
            questions: {
              select: {
                questionId: true,
                weight: true,
                question: {
                  select: {
                    id: true,
                    title: true,
                    questionType: true,
                    weight: true,
                  },
                },
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        answers: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.exam.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to view this assignment',
      );
    }

    // Build a map of questionId to question info for answers
    const questionMap = new Map(
      assignment.exam.questions.map((eq) => [
        eq.questionId,
        {
          title: eq.question.title,
          questionType: eq.question.questionType,
          weight: eq.weight,
        },
      ]),
    );

    return {
      id: assignment.id,
      examId: assignment.examId,
      examTitle: assignment.exam.title,
      studentId: assignment.studentId,
      studentName: assignment.student.fullName,
      studentEmail: assignment.student.email,
      magicToken: assignment.magicToken,
      status: assignment.status,
      assignedAt: assignment.assignedAt,
      startedAt: assignment.startedAt,
      submittedAt: assignment.submittedAt,
      score: assignment.score,
      answers: assignment.answers.map((answer) => {
        const questionInfo = questionMap.get(answer.questionId);
        return {
          id: answer.id,
          questionId: answer.questionId,
          questionTitle: questionInfo?.title ?? '',
          questionType: questionInfo?.questionType ?? '',
          questionWeight: questionInfo?.weight ?? 1,
          selectedOptionId: answer.selectedOptionId,
          answerText: answer.answerText,
          answerLatex: answer.answerLatex,
          answerNumeric: answer.answerNumeric,
          answerPoint: answer.answerPoint as Record<string, unknown> | null,
          score: answer.score,
          feedback: answer.feedback,
          createdAt: answer.createdAt,
        };
      }),
    };
  }
}
