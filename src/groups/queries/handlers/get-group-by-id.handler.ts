import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetGroupByIdQuery } from '../get-group-by-id.query';
import { PrismaService } from '../../../prisma';
import { GroupResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetGroupByIdQuery)
export class GetGroupByIdHandler implements IQueryHandler<GetGroupByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetGroupByIdQuery): Promise<GroupResponseDto> {
    const { groupId, teacherId } = query;

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: {
          include: {
            student: true,
          },
          orderBy: {
            student: { fullName: 'asc' },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to view this group',
      );
    }

    return {
      id: group.id,
      name: group.name,
      year: group.year,
      career: group.career,
      createdAt: group.createdAt,
      students: group.students.map((sg) => ({
        id: sg.student.id,
        fullName: sg.student.fullName,
        email: sg.student.email,
      })),
      studentCount: group.students.length,
    };
  }
}
