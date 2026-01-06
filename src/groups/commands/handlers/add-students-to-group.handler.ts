import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AddStudentsToGroupCommand } from '../add-students-to-group.command';
import { PrismaService } from '../../../prisma';
import { GroupResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(AddStudentsToGroupCommand)
export class AddStudentsToGroupHandler
  implements ICommandHandler<AddStudentsToGroupCommand>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: AddStudentsToGroupCommand): Promise<GroupResponseDto> {
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

    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        teacherId,
      },
    });

    if (students.length !== studentIds.length) {
      throw new BadRequestException(
        'One or more students not found or do not belong to you',
      );
    }

    const existingAssociations = await this.prisma.studentGroup.findMany({
      where: {
        groupId,
        studentId: { in: studentIds },
      },
    });

    const existingStudentIds = new Set(
      existingAssociations.map((a) => a.studentId),
    );
    const newStudentIds = studentIds.filter((id) => !existingStudentIds.has(id));

    if (newStudentIds.length > 0) {
      await this.prisma.studentGroup.createMany({
        data: newStudentIds.map((studentId) => ({
          studentId,
          groupId,
        })),
      });
    }

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
