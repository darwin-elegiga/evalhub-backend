import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SubmitAssignmentCommand } from '../submit-assignment.command';
import { PrismaService } from '../../../prisma';
import { SubmitAssignmentResponseDto } from '../../dtos';

interface MultipleChoiceConfig {
  options?: Array<{
    id: string;
    text: string;
    isCorrect?: boolean;
  }>;
}

@Injectable()
@CommandHandler(SubmitAssignmentCommand)
export class SubmitAssignmentHandler
  implements ICommandHandler<SubmitAssignmentCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: SubmitAssignmentCommand,
  ): Promise<SubmitAssignmentResponseDto> {
    const { assignmentId } = command;

    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        exam: {
          include: {
            questions: {
              include: {
                question: true,
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot submit assignment with status: ${assignment.status}`,
      );
    }

    // Calculate score for multiple choice questions
    let totalScore = 0;
    let maxScore = 0;

    for (const examQuestion of assignment.exam.questions) {
      const question = examQuestion.question;
      const answer = assignment.answers.find(
        (a) => a.questionId === question.id,
      );
      const questionWeight = examQuestion.weight;

      if (question.questionType === 'multiple_choice') {
        maxScore += questionWeight;

        if (answer?.selectedOptionId) {
          // typeConfig contains options for multiple_choice questions
          const typeConfig = question.typeConfig as MultipleChoiceConfig;
          const options = typeConfig?.options || [];
          const selectedOption = options.find(
            (o) => o.id === answer.selectedOptionId,
          );
          if (selectedOption?.isCorrect) {
            totalScore += questionWeight;

            // Update answer score
            await this.prisma.studentAnswer.update({
              where: { id: answer.id },
              data: { score: questionWeight },
            });
          } else {
            await this.prisma.studentAnswer.update({
              where: { id: answer.id },
              data: { score: 0 },
            });
          }
        }
      } else {
        // For other question types, add to maxScore but don't auto-grade
        maxScore += questionWeight;
      }
    }

    // Calculate percentage score
    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    // Update assignment status
    const updatedAssignment = await this.prisma.examAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'submitted',
        submittedAt: new Date(),
        score: percentageScore,
      },
    });

    return {
      success: true,
      assignment: {
        id: updatedAssignment.id,
        examId: updatedAssignment.examId,
        studentId: updatedAssignment.studentId,
        magicToken: updatedAssignment.magicToken,
        status: updatedAssignment.status,
        assignedAt: updatedAssignment.assignedAt,
        startedAt: updatedAssignment.startedAt,
        submittedAt: updatedAssignment.submittedAt,
        score: updatedAssignment.score,
      },
    };
  }
}
