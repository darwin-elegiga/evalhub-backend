import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeleteSubjectCommand } from '../delete-subject.command';
import { PrismaService } from '../../../prisma';
import { SubjectDeletedEvent } from '../../events';

@Injectable()
@CommandHandler(DeleteSubjectCommand)
export class DeleteSubjectHandler
  implements ICommandHandler<DeleteSubjectCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteSubjectCommand): Promise<void> {
    const { subjectId, teacherId } = command;

    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (subject.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to delete this subject',
      );
    }

    await this.prisma.subject.delete({
      where: { id: subjectId },
    });

    this.eventBus.publish(
      new SubjectDeletedEvent(subjectId, teacherId, subject.name),
    );
  }
}
