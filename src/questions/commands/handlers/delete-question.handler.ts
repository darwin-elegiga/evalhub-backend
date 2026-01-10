import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DeleteQuestionCommand } from '../delete-question.command';
import { PrismaService } from '../../../prisma';
import { QuestionDeletedEvent } from '../../events';

@Injectable()
@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionHandler implements ICommandHandler<DeleteQuestionCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteQuestionCommand): Promise<void> {
    const { questionId, teacherId } = command;

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to delete this question',
      );
    }

    await this.prisma.question.delete({
      where: { id: questionId },
    });

    this.eventBus.publish(new QuestionDeletedEvent(questionId, teacherId));
  }
}
