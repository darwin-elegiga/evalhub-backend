import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetAssignmentGradingQuery } from '../get-assignment-grading.query';
import { PrismaService } from '../../../prisma';
import { GradingResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetAssignmentGradingQuery)
export class GetAssignmentGradingHandler
  implements IQueryHandler<GetAssignmentGradingQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAssignmentGradingQuery): Promise<GradingResponseDto> {
    const { assignmentId, teacherId } = query;

    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: assignmentId },
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
            email: true,
            year: true,
            career: true,
          },
        },
        answers: true,
        grade: true,
        events: {
          orderBy: {
            timestamp: 'asc',
          },
        },
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

    // Build questions with answers
    const questions = assignment.exam.questions.map((eq) => {
      const question = eq.question;
      const answer = assignment.answers.find((a) => a.questionId === question.id);

      return {
        id: question.id,
        title: question.title,
        content: question.content,
        questionType: question.questionType,
        typeConfig: question.typeConfig as Record<string, unknown>,
        difficulty: question.difficulty,
        weight: eq.weight,
        answer: answer
          ? {
              id: answer.id,
              selectedOptionId: answer.selectedOptionId,
              answerText: answer.answerText,
              answerLatex: answer.answerLatex,
              answerNumeric: answer.answerNumeric,
              answerPoint: answer.answerPoint as Record<string, unknown> | null,
              score: answer.score,
              feedback: answer.feedback,
            }
          : null,
      };
    });

    return {
      assignment: {
        id: assignment.id,
        examId: assignment.examId,
        studentId: assignment.studentId,
        magicToken: assignment.magicToken,
        status: assignment.status,
        assignedAt: assignment.assignedAt,
        startedAt: assignment.startedAt,
        submittedAt: assignment.submittedAt,
        score: assignment.score,
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
        email: assignment.student.email,
        year: assignment.student.year,
        career: assignment.student.career,
      },
      questions,
      answers: assignment.answers.map((answer) => ({
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
      })),
      events: assignment.events.map((event) => ({
        id: event.id,
        assignmentId: event.assignmentId,
        eventType: event.eventType,
        severity: event.severity,
        timestamp: event.timestamp,
        details: event.details as Record<string, unknown> | null,
      })),
      existingGrade: assignment.grade
        ? {
            id: assignment.grade.id,
            assignmentId: assignment.grade.assignmentId,
            averageScore: assignment.grade.averageScore,
            finalGrade: assignment.grade.finalGrade,
            roundingMethod: assignment.grade.roundingMethod,
            gradedAt: assignment.grade.gradedAt,
            gradedBy: assignment.grade.gradedBy,
          }
        : null,
    };
  }
}
