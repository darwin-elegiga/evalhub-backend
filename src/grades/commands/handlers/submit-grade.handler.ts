import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SubmitGradeCommand } from '../submit-grade.command';
import { PrismaService } from '../../../prisma';
import { SubmitGradeResponseDto } from '../../dtos';
import { RoundingMethod } from '@prisma/client';

@Injectable()
@CommandHandler(SubmitGradeCommand)
export class SubmitGradeHandler implements ICommandHandler<SubmitGradeCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SubmitGradeCommand): Promise<SubmitGradeResponseDto> {
    const {
      assignmentId,
      teacherId,
      averageScore,
      finalGrade,
      roundingMethod,
    } = command;

    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        exam: true,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.exam.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to grade this assignment',
      );
    }

    if (assignment.status !== 'submitted') {
      throw new BadRequestException(
        'Assignment must be in submitted status to be graded',
      );
    }

    const grade = await this.prisma.$transaction(async (tx) => {
      const createdGrade = await tx.assignmentGrade.upsert({
        where: { assignmentId },
        create: {
          assignmentId,
          averageScore,
          finalGrade,
          roundingMethod: roundingMethod as RoundingMethod,
          gradedBy: teacherId,
        },
        update: {
          averageScore,
          finalGrade,
          roundingMethod: roundingMethod as RoundingMethod,
          gradedBy: teacherId,
          gradedAt: new Date(),
        },
      });

      await tx.examAssignment.update({
        where: { id: assignmentId },
        data: { status: 'graded' },
      });

      return createdGrade;
    });

    return {
      id: grade.id,
      assignmentId: grade.assignmentId,
      averageScore: grade.averageScore,
      finalGrade: grade.finalGrade,
      roundingMethod: grade.roundingMethod,
      gradedAt: grade.gradedAt,
      gradedBy: grade.gradedBy,
    };
  }
}
