import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentCommand } from '../create-student.command';
import { PrismaService } from '../../../prisma';
import { StudentCreatedEvent } from '../../events';
import { StudentResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(CreateStudentCommand)
export class CreateStudentHandler
  implements ICommandHandler<CreateStudentCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateStudentCommand): Promise<StudentResponseDto> {
    const { teacherId, fullName, email, year, career, groupIds } = command;

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

    if (groupIds && groupIds.length > 0) {
      const groups = await this.prisma.group.findMany({
        where: {
          id: { in: groupIds },
          teacherId,
        },
      });

      if (groups.length !== groupIds.length) {
        throw new NotFoundException(
          'One or more groups not found or do not belong to you',
        );
      }
    }

    const student = await this.prisma.student.create({
      data: {
        teacherId,
        fullName,
        email: email.toLowerCase(),
        year,
        career,
        groups:
          groupIds && groupIds.length > 0
            ? {
                create: groupIds.map((groupId) => ({ groupId })),
              }
            : undefined,
      },
      include: {
        groups: {
          include: {
            group: true,
          },
        },
      },
    });

    this.eventBus.publish(
      new StudentCreatedEvent(student.id, teacherId, fullName, email),
    );

    return {
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      year: student.year,
      career: student.career,
      createdAt: student.createdAt,
      groups: student.groups.map((sg) => ({
        id: sg.group.id,
        name: sg.group.name,
      })),
    };
  }
}
