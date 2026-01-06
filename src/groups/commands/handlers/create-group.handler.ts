import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateGroupCommand } from '../create-group.command';
import { PrismaService } from '../../../prisma';
import { GroupCreatedEvent } from '../../events';
import { GroupResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(CreateGroupCommand)
export class CreateGroupHandler implements ICommandHandler<CreateGroupCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateGroupCommand): Promise<GroupResponseDto> {
    const { teacherId, name, year, career } = command;

    const existingGroup = await this.prisma.group.findUnique({
      where: {
        teacherId_name_year: {
          teacherId,
          name,
          year,
        },
      },
    });

    if (existingGroup) {
      throw new ConflictException(
        'Group with this name and year already exists',
      );
    }

    const group = await this.prisma.group.create({
      data: {
        teacherId,
        name,
        year,
        career,
      },
    });

    this.eventBus.publish(
      new GroupCreatedEvent(group.id, teacherId, name, year, career),
    );

    return {
      id: group.id,
      name: group.name,
      year: group.year,
      career: group.career,
      createdAt: group.createdAt,
      students: [],
      studentCount: 0,
    };
  }
}
