import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SaveAnswerCommand } from '../save-answer.command';
import { PrismaService } from '../../../prisma';
import { SaveAnswerResponseDto } from '../../dtos';
import { Prisma } from '@prisma/client';

@Injectable()
@CommandHandler(SaveAnswerCommand)
export class SaveAnswerHandler implements ICommandHandler<SaveAnswerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SaveAnswerCommand): Promise<SaveAnswerResponseDto> {
    const {
      assignmentId,
      questionId,
      selectedOptionId,
      answerText,
      answerLatex,
      answerNumeric,
      answerPoint,
    } = command;

    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status !== 'in_progress') {
      throw new BadRequestException(
        `Cannot save answer for assignment with status: ${assignment.status}`,
      );
    }

    // Upsert the answer
    const answer = await this.prisma.studentAnswer.upsert({
      where: {
        assignmentId_questionId: {
          assignmentId,
          questionId,
        },
      },
      create: {
        assignmentId,
        questionId,
        selectedOptionId: selectedOptionId ?? null,
        answerText: answerText ?? null,
        answerLatex: answerLatex ?? null,
        answerNumeric: answerNumeric ?? null,
        answerPoint: answerPoint as Prisma.InputJsonValue ?? null,
      },
      update: {
        selectedOptionId: selectedOptionId ?? null,
        answerText: answerText ?? null,
        answerLatex: answerLatex ?? null,
        answerNumeric: answerNumeric ?? null,
        answerPoint: answerPoint as Prisma.InputJsonValue ?? null,
      },
    });

    return {
      answer: {
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
      },
    };
  }
}
