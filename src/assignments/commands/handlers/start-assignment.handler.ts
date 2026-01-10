import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { StartAssignmentCommand } from '../start-assignment.command';
import { PrismaService } from '../../../prisma';
import { StartAssignmentResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(StartAssignmentCommand)
export class StartAssignmentHandler implements ICommandHandler<StartAssignmentCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: StartAssignmentCommand,
  ): Promise<StartAssignmentResponseDto> {
    const { assignmentId } = command;

    const assignment = await this.prisma.examAssignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.status !== 'pending') {
      throw new BadRequestException(
        `Cannot start assignment with status: ${assignment.status}`,
      );
    }

    const updatedAssignment = await this.prisma.examAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'in_progress',
        startedAt: new Date(),
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
