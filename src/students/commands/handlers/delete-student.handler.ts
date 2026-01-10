import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeleteStudentCommand } from '../delete-student.command';
import { PrismaService } from '../../../prisma';
import { StudentDeletedEvent } from '../../events';

@Injectable()
@CommandHandler(DeleteStudentCommand)
export class DeleteStudentHandler implements ICommandHandler<DeleteStudentCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteStudentCommand): Promise<void> {
    const { studentId, teacherId } = command;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to delete this student',
      );
    }

    await this.prisma.student.delete({
      where: { id: studentId },
    });

    this.eventBus.publish(new StudentDeletedEvent(studentId, teacherId));
  }
}
