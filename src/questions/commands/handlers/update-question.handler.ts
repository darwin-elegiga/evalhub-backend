import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateQuestionCommand } from '../update-question.command';
import { PrismaService } from '../../../prisma';
import { QuestionUpdatedEvent } from '../../events';
import { QuestionResponseDto } from '../../dtos';
import { QuestionType, Difficulty, Prisma } from '@prisma/client';

@Injectable()
@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionHandler
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateQuestionCommand): Promise<QuestionResponseDto> {
    const {
      questionId,
      teacherId,
      title,
      content,
      questionType,
      typeConfig,
      subjectId,
      topicId,
      difficulty,
      estimatedTimeMinutes,
      tags,
      weight,
    } = command;

    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to update this question',
      );
    }

    if (subjectId !== undefined && subjectId !== null) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!subject || subject.teacherId !== teacherId) {
        throw new NotFoundException('Subject not found');
      }
    }

    if (topicId !== undefined && topicId !== null) {
      const topic = await this.prisma.topic.findUnique({
        where: { id: topicId },
      });
      if (!topic) {
        throw new NotFoundException('Topic not found');
      }
    }

    const updatedQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        title: title ?? undefined,
        content: content ?? undefined,
        questionType: questionType
          ? (questionType as QuestionType)
          : undefined,
        typeConfig: typeConfig
          ? (typeConfig as Prisma.InputJsonValue)
          : undefined,
        subjectId: subjectId !== undefined ? subjectId : undefined,
        topicId: topicId !== undefined ? topicId : undefined,
        difficulty: difficulty ? (difficulty as Difficulty) : undefined,
        estimatedTimeMinutes:
          estimatedTimeMinutes !== undefined ? estimatedTimeMinutes : undefined,
        tags: tags ?? undefined,
        weight: weight ?? undefined,
      },
    });

    this.eventBus.publish(new QuestionUpdatedEvent(questionId, teacherId));

    return {
      id: updatedQuestion.id,
      teacherId: updatedQuestion.teacherId,
      subjectId: updatedQuestion.subjectId,
      topicId: updatedQuestion.topicId,
      title: updatedQuestion.title,
      content: updatedQuestion.content,
      questionType: updatedQuestion.questionType,
      typeConfig: updatedQuestion.typeConfig as Record<string, unknown>,
      difficulty: updatedQuestion.difficulty,
      estimatedTimeMinutes: updatedQuestion.estimatedTimeMinutes,
      tags: updatedQuestion.tags,
      weight: updatedQuestion.weight,
      timesUsed: updatedQuestion.timesUsed,
      averageScore: updatedQuestion.averageScore,
      createdAt: updatedQuestion.createdAt,
      updatedAt: updatedQuestion.updatedAt,
    };
  }
}
