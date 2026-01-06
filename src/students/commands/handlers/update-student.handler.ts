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
    const { studentId, teacherId, fullName, email, year, career } = command;

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

    const updatedStudent = await this.prisma.student.update({
      where: { id: studentId },
      data: {
        fullName: fullName ?? undefined,
        email: email ? email.toLowerCase() : undefined,
        year: year !== undefined ? year : undefined,
        career: career !== undefined ? career : undefined,
      },
      include: {
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

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
