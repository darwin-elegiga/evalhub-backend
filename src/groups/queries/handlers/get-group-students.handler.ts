import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetGroupStudentsQuery } from '../get-group-students.query';
import { PrismaService } from '../../../prisma';
import { StudentResponseDto } from '../../../students/dtos';

@Injectable()
@QueryHandler(GetGroupStudentsQuery)
export class GetGroupStudentsHandler implements IQueryHandler<GetGroupStudentsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetGroupStudentsQuery): Promise<StudentResponseDto[]> {
    const { groupId, teacherId } = query;

    // Verify group exists and belongs to teacher
    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to view this group',
      );
    }

    // Get students in the group with their full details
    const studentGroups = await this.prisma.studentGroup.findMany({
      where: { groupId },
      include: {
        student: {
          include: {
            groups: {
              include: {
                group: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: { fullName: 'asc' },
      },
    });

    return studentGroups.map((sg) => ({
      id: sg.student.id,
      fullName: sg.student.fullName,
      email: sg.student.email,
      year: sg.student.year,
      career: sg.student.career,
      createdAt: sg.student.createdAt,
      groups: sg.student.groups.map((g) => ({
        id: g.group.id,
        name: g.group.name,
      })),
    }));
  }
}
