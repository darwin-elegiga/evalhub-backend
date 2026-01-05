import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetCurrentUserQuery } from '../get-current-user.query';
import { PrismaService } from '../../../prisma';
import { UserResponseDto } from '../../dtos';

@Injectable()
@QueryHandler(GetCurrentUserQuery)
export class GetCurrentUserHandler implements IQueryHandler<GetCurrentUserQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCurrentUserQuery): Promise<UserResponseDto> {
    const { userId } = query;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }
}
