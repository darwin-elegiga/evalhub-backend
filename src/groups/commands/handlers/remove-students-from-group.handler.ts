import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { RemoveStudentsFromGroupCommand } from '../remove-students-from-group.command';
import { PrismaService } from '../../../prisma';
import { GroupResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(RemoveStudentsFromGroupCommand)
export class RemoveStudentsFromGroupHandler
  implements ICommandHandler<RemoveStudentsFromGroupCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    command: RemoveStudentsFromGroupCommand,
  ): Promise<GroupResponseDto> {
    const { groupId, teacherId, studentIds } = command;

    const group = await this.prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    if (group.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to modify this group',
      );
    }

    await this.prisma.studentGroup.deleteMany({
      where: {
        groupId,
        studentId: { in: studentIds },
      },
    });

    const updatedGroup = await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        students: {
          include: {
            student: true,
          },
        },
      },
    });

    return {
      id: updatedGroup!.id,
      name: updatedGroup!.name,
      year: updatedGroup!.year,
      career: updatedGroup!.career,
      createdAt: updatedGroup!.createdAt,
      students: updatedGroup!.students.map((sg) => ({
        id: sg.student.id,
        fullName: sg.student.fullName,
        email: sg.student.email,
      })),
      studentCount: updatedGroup!.students.length,
    };
  }
}
