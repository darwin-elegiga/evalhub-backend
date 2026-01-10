import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetGradesQuery } from '../get-grades.query';
import { PrismaService } from '../../../prisma';
import { GradeListItemDto } from '../../dtos';
import { Prisma } from '@prisma/client';

@Injectable()
@QueryHandler(GetGradesQuery)
export class GetGradesHandler implements IQueryHandler<GetGradesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetGradesQuery): Promise<GradeListItemDto[]> {
    const { teacherId, career, groupId, studentId } = query;

    const studentWhere: Prisma.StudentWhereInput = {};

    if (career) {
      studentWhere.career = {
        contains: career,
        mode: 'insensitive',
      };
    }

    if (groupId) {
      studentWhere.groups = {
        some: {
          groupId,
        },
      };
    }

    const assignmentWhere: Prisma.ExamAssignmentWhereInput = {
      exam: {
        teacherId,
      },
    };

    if (studentId) {
      assignmentWhere.studentId = studentId;
    }

    if (Object.keys(studentWhere).length > 0) {
      assignmentWhere.student = studentWhere;
    }

    const grades = await this.prisma.assignmentGrade.findMany({
      where: {
        assignment: assignmentWhere,
      },
      include: {
        assignment: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                email: true,
                career: true,
              },
            },
            exam: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        gradedAt: 'desc',
      },
    });

    return grades.map((grade) => ({
      id: grade.id,
      assignmentId: grade.assignmentId,
      averageScore: grade.averageScore,
      finalGrade: grade.finalGrade,
      roundingMethod: grade.roundingMethod,
      gradedAt: grade.gradedAt,
      gradedBy: grade.gradedBy,
      student: {
        id: grade.assignment.student.id,
        fullName: grade.assignment.student.fullName,
        email: grade.assignment.student.email,
        career: grade.assignment.student.career,
      },
      exam: {
        id: grade.assignment.exam.id,
        title: grade.assignment.exam.title,
      },
    }));
  }
}
