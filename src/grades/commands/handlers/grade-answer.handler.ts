import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GradeAnswerCommand } from '../grade-answer.command';
import { PrismaService } from '../../../prisma';
import { GradeAnswerResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(GradeAnswerCommand)
export class GradeAnswerHandler implements ICommandHandler<GradeAnswerCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: GradeAnswerCommand): Promise<GradeAnswerResponseDto> {
    const { answerId, teacherId, score, feedback } = command;

    const answer = await this.prisma.studentAnswer.findUnique({
      where: { id: answerId },
      include: {
        assignment: {
          include: {
            exam: true,
          },
        },
      },
    });

    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    if (answer.assignment.exam.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to grade this answer',
      );
    }

    const updatedAnswer = await this.prisma.studentAnswer.update({
      where: { id: answerId },
      data: {
        score,
        feedback,
      },
    });

    return {
      id: updatedAnswer.id,
      assignmentId: updatedAnswer.assignmentId,
      questionId: updatedAnswer.questionId,
      score: updatedAnswer.score,
      feedback: updatedAnswer.feedback,
      updatedAt: updatedAnswer.updatedAt,
    };
  }
}
