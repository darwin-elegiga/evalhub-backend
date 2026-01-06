import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UpdateStudentCommand } from '../update-student.command';
import { PrismaService } from '../../../prisma';
import { StudentUpdatedEvent } from '../../events';
import { StudentResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(UpdateStudentCommand)
export class UpdateStudentHandler
  implements ICommandHandler<UpdateStudentCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateStudentCommand): Promise<StudentResponseDto> {
    const { studentId, teacherId, fullName, email, year, career, groupIds } =
      command;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to update this student',
      );
    }

    if (email && email.toLowerCase() !== student.email) {
      const existingStudent = await this.prisma.student.findUnique({
        where: {
          teacherId_email: {
            teacherId,
            email: email.toLowerCase(),
          },
        },
      });

      if (existingStudent) {
        throw new ConflictException('Student with this email already exists');
      }
    }

    // Verify all groups exist and belong to the teacher
    if (groupIds && groupIds.length > 0) {
      const groups = await this.prisma.group.findMany({
        where: {
          id: { in: groupIds },
          teacherId,
        },
        select: { id: true },
      });

      if (groups.length !== groupIds.length) {
        throw new NotFoundException('One or more groups not found');
      }
    }

    // Use transaction to update student and group relations
    const updatedStudent = await this.prisma.$transaction(async (tx) => {
      // Update student data
      const updated = await tx.student.update({
        where: { id: studentId },
        data: {
          fullName: fullName ?? undefined,
          email: email ? email.toLowerCase() : undefined,
          year: year !== undefined ? year : undefined,
          career: career !== undefined ? career : undefined,
        },
      });

      // Update group relations if groupIds is provided
      if (groupIds !== undefined) {
        // Remove all existing group relations
        await tx.studentGroup.deleteMany({
          where: { studentId },
        });

        // Add new group relations
        if (groupIds.length > 0) {
          await tx.studentGroup.createMany({
            data: groupIds.map((groupId) => ({
              studentId,
              groupId,
            })),
          });
        }
      }

      // Fetch updated student with groups
      return tx.student.findUnique({
        where: { id: studentId },
        include: {
          groups: {
            include: {
              group: true,
            },
          },
        },
      });
    });

    if (!updatedStudent) {
      throw new NotFoundException('Student not found after update');
    }

    this.eventBus.publish(new StudentUpdatedEvent(studentId, teacherId));

    return {
      id: updatedStudent.id,
      fullName: updatedStudent.fullName,
      email: updatedStudent.email,
      year: updatedStudent.year,
      career: updatedStudent.career,
      createdAt: updatedStudent.createdAt,
      groups: updatedStudent.groups.map((sg) => ({
        id: sg.group.id,
        name: sg.group.name,
      })),
    };
  }
}
