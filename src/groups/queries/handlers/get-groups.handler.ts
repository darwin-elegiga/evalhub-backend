import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetGroupsQuery } from '../get-groups.query';
import { PrismaService } from '../../../prisma';
import { GroupResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetGroupsQuery)
export class GetGroupsHandler implements IQueryHandler<GetGroupsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetGroupsQuery): Promise<GroupResponseDto[]> {
    const { teacherId } = query;

    const groups = await this.prisma.group.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: { students: true },
        },
      },
      orderBy: [{ year: 'desc' }, { name: 'asc' }],
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      year: group.year,
      career: group.career,
      createdAt: group.createdAt,
      studentCount: group._count.students,
    }));
  }
}
