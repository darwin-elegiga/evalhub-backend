import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetStudentsQuery } from '../get-students.query';
import { PrismaService } from '../../../prisma';
import { StudentResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetStudentsQuery)
export class GetStudentsHandler implements IQueryHandler<GetStudentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetStudentsQuery): Promise<StudentResponseDto[]> {
    const { teacherId } = query;

    const students = await this.prisma.student.findMany({
      where: { teacherId },
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
