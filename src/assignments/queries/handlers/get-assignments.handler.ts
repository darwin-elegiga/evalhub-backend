import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetAssignmentsQuery } from '../get-assignments.query';
import { PrismaService } from '../../../prisma';
import { AssignmentResponseDto } from '../../dtos';
import { Prisma } from '@prisma/client';

@Injectable()
@QueryHandler(GetAssignmentsQuery)
export class GetAssignmentsHandler implements IQueryHandler<GetAssignmentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAssignmentsQuery): Promise<AssignmentResponseDto[]> {
    const { teacherId, examId, studentId, status } = query;

    const where: Prisma.ExamAssignmentWhereInput = {
      exam: {
        teacherId,
      },
    };

    if (examId) {
      where.examId = examId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (status) {
      where.status = status as Prisma.EnumAssignmentStatusFilter;
    }

    const assignments = await this.prisma.examAssignment.findMany({
      where,
      include: {
        exam: {
          select: {
            id: true,
            title: true,
          },
        },
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return assignments.map((assignment) => ({
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
    }));
  }
}
