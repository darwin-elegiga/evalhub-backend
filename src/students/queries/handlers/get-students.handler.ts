import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetStudentsQuery } from '../get-students.query';
import { PrismaService } from '../../../prisma';
import { StudentResponseDto } from '../../dtos';
import { Prisma } from '@prisma/client';

@Injectable()
@QueryHandler(GetStudentsQuery)
export class GetStudentsHandler implements IQueryHandler<GetStudentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetStudentsQuery): Promise<StudentResponseDto[]> {
    const { teacherId, groupId, career, year, search } = query;

    const where: Prisma.StudentWhereInput = { teacherId };

    // Filter by group
    if (groupId) {
      where.groups = {
        some: {
          groupId,
        },
      };
    }

    // Filter by career
    if (career) {
      where.career = {
        contains: career,
        mode: 'insensitive',
      };
    }

    // Filter by year
    if (year) {
      where.year = year;
    }

    // Search by name or email
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const students = await this.prisma.student.findMany({
      where,
      include: {
        groups: {
          include: {
            group: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    return students.map((student) => ({
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      year: student.year,
      career: student.career,
      createdAt: student.createdAt,
      groups: student.groups.map((sg) => ({
        id: sg.group.id,
        name: sg.group.name,
      })),
    }));
  }
}
