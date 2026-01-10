import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
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
    const { teacherId, examId, studentIds, groupId } = command;

    // Validate that at least one of studentIds or groupId is provided
    if ((!studentIds || studentIds.length === 0) && !groupId) {
      throw new BadRequestException(
        'Either studentIds or groupId must be provided',
      );
    }

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

    // Resolve student IDs (either from direct list or from group)
    let resolvedStudentIds: string[] = [];

    if (groupId) {
      // Verify group exists and belongs to teacher
      const group = await this.prisma.group.findUnique({
        where: { id: groupId },
        include: {
          students: {
            select: { studentId: true },
          },
        },
      });

      if (!group) {
        throw new NotFoundException('Group not found');
      }

      if (group.teacherId !== teacherId) {
        throw new ForbiddenException(
          'You do not have permission to use this group',
        );
      }

      resolvedStudentIds = group.students.map((s) => s.studentId);

      if (resolvedStudentIds.length === 0) {
        throw new BadRequestException('Group has no students');
      }
    } else if (studentIds && studentIds.length > 0) {
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

      resolvedStudentIds = studentIds;
    }

    // Check for existing assignments
    const existingAssignments = await this.prisma.examAssignment.findMany({
      where: {
        examId,
        studentId: { in: resolvedStudentIds },
      },
      select: { studentId: true },
    });

    // Filter out students that already have assignments
    const existingStudentIds = new Set(
      existingAssignments.map((a) => a.studentId),
    );
    const newStudentIds = resolvedStudentIds.filter(
      (id) => !existingStudentIds.has(id),
    );

    if (newStudentIds.length === 0) {
      throw new ConflictException(
        'All students are already assigned to this exam',
      );
    }

    // Create assignments with magic tokens
    const baseUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const assignments = await Promise.all(
      newStudentIds.map(async (studentId) => {
        const magicToken = randomBytes(32).toString('hex');

        const created = await this.prisma.examAssignment.create({
          data: {
            examId,
            studentId,
            magicToken,
          },
          include: {
            student: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        });

        return {
          studentId,
          studentName: created.student.fullName,
          studentEmail: created.student.email,
          magicToken,
          magicLink: `${baseUrl}/exam/${magicToken}`,
        };
      }),
    );

    this.eventBus.publish(
      new ExamAssignedEvent(examId, teacherId, newStudentIds.length),
    );

    return {
      assignments,
      skippedCount: existingStudentIds.size,
    };
  }
}
