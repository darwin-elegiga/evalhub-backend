import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeleteExamCommand } from '../delete-exam.command';
import { PrismaService } from '../../../prisma';
import { ExamDeletedEvent } from '../../events';

@Injectable()
@CommandHandler(DeleteExamCommand)
export class DeleteExamHandler implements ICommandHandler<DeleteExamCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteExamCommand): Promise<void> {
    const { examId, teacherId } = command;

    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to delete this exam',
      );
    }

    await this.prisma.exam.delete({
      where: { id: examId },
    });

    this.eventBus.publish(new ExamDeletedEvent(examId, teacherId));
  }
}
