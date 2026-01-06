import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetStudentByIdQuery } from '../get-student-by-id.query';
import { PrismaService } from '../../../prisma';
import { StudentResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetStudentByIdQuery)
export class GetStudentByIdHandler
  implements IQueryHandler<GetStudentByIdQuery>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetStudentByIdQuery): Promise<StudentResponseDto> {
    const { studentId, teacherId } = query;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to view this student',
      );
    }

    return {
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
    };
  }
}
