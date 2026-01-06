import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UpdateGroupCommand } from '../update-group.command';
import { PrismaService } from '../../../prisma';
import { GroupUpdatedEvent } from '../../events';
import { GroupResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(UpdateGroupCommand)
export class UpdateGroupHandler implements ICommandHandler<UpdateGroupCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateGroupCommand): Promise<GroupResponseDto> {
    const { groupId, teacherId, name, year, career } = command;

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to update this group',
      );
    }

    const newName = name ?? group.name;
    const newYear = year ?? group.year;

    if (newName !== group.name || newYear !== group.year) {
      const existingGroup = await this.prisma.group.findUnique({
        where: {
          teacherId_name_year: {
            teacherId,
            name: newName,
            year: newYear,
          },
        },
      });

      if (existingGroup && existingGroup.id !== groupId) {
        throw new ConflictException(
          'Group with this name and year already exists',
        );
      }
    }

    const updatedGroup = await this.prisma.group.update({
      where: { id: groupId },
      data: {
        name: name ?? undefined,
        year: year ?? undefined,
        career: career ?? undefined,
      },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    this.eventBus.publish(new GroupUpdatedEvent(groupId, teacherId));

    return {
      id: updatedGroup.id,
      name: updatedGroup.name,
      year: updatedGroup.year,
      career: updatedGroup.career,
      createdAt: updatedGroup.createdAt,
      students: updatedGroup.students.map((sg) => ({
        id: sg.student.id,
        fullName: sg.student.fullName,
        email: sg.student.email,
      })),
      studentCount: updatedGroup.students.length,
    };
  }
}
