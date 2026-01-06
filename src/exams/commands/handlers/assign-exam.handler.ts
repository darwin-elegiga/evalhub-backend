import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { AssignExamCommand } from '../assign-exam.command';
import { PrismaService } from '../../../prisma';
import { ExamAssignedEvent } from '../../events';
import { AssignExamResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(AssignExamCommand)
export class AssignExamHandler implements ICommandHandler<AssignExamCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
    private readonly configService: ConfigService,
  ) {}

  async execute(command: AssignExamCommand): Promise<AssignExamResponseDto> {
    const { teacherId, examId, studentIds } = command;

    // Verify exam exists and belongs to teacher
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to assign this exam',
      );
    }

    // Verify all students exist and belong to the teacher
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        teacherId,
      },
      select: { id: true },
    });

    if (students.length !== studentIds.length) {
      throw new NotFoundException('One or more students not found');
    }

    // Check for existing assignments
    const existingAssignments = await this.prisma.examAssignment.findMany({
      where: {
        examId,
        studentId: { in: studentIds },
      },
      select: { studentId: true },
    });

    if (existingAssignments.length > 0) {
      const existingIds = existingAssignments.map((a) => a.studentId);
      throw new ConflictException(
        `Some students are already assigned to this exam: ${existingIds.join(', ')}`,
      );
    }

    // Create assignments with magic tokens
    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const assignments = await Promise.all(
      studentIds.map(async (studentId) => {
        const magicToken = randomBytes(32).toString('hex');

        await this.prisma.examAssignment.create({
          data: {
            examId,
            studentId,
            magicToken,
          },
        });

        return {
          studentId,
          magicToken,
          magicLink: `${baseUrl}/exam/${magicToken}`,
        };
      }),
    );

    this.eventBus.publish(
      new ExamAssignedEvent(examId, teacherId, studentIds.length),
    );

    return { assignments };
  }
}
