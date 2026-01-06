import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetCareersQuery } from '../get-careers.query';
import { PrismaService } from '../../../prisma';
import { CareerResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetCareersQuery)
export class GetCareersHandler implements IQueryHandler<GetCareersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCareersQuery): Promise<CareerResponseDto[]> {
    const { includeInactive } = query;

    const careers = await this.prisma.career.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { name: 'asc' },
    });

    return careers.map((career) => ({
      id: career.id,
      name: career.name,
      code: career.code,
      isActive: career.isActive,
      createdAt: career.createdAt,
      updatedAt: career.updatedAt,
    }));
  }
}
