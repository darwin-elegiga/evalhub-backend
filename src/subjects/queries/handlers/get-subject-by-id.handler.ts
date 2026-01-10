import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { GetSubjectByIdQuery } from '../get-subject-by-id.query';
import { PrismaService } from '../../../prisma';
import { SubjectResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetSubjectByIdQuery)
export class GetSubjectByIdHandler implements IQueryHandler<GetSubjectByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetSubjectByIdQuery): Promise<SubjectResponseDto> {
    const { subjectId, teacherId } = query;

    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (subject.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to view this subject',
      );
    }

    return {
      id: subject.id,
      name: subject.name,
      description: subject.description,
      color: subject.color,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }
}
