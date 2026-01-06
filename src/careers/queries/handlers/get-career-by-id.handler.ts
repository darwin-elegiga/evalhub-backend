import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetCareerByIdQuery } from '../get-career-by-id.query';
import { PrismaService } from '../../../prisma';
import { CareerResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetCareerByIdQuery)
export class GetCareerByIdHandler implements IQueryHandler<GetCareerByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCareerByIdQuery): Promise<CareerResponseDto> {
    const { careerId } = query;

    const career = await this.prisma.career.findUnique({
      where: { id: careerId },
    });

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    return {
      id: career.id,
      name: career.name,
      code: career.code,
      isActive: career.isActive,
      createdAt: career.createdAt,
      updatedAt: career.updatedAt,
    };
  }
}
