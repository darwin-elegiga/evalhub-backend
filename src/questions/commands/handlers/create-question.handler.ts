import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuestionCommand } from '../create-question.command';
import { PrismaService } from '../../../prisma';
import { QuestionCreatedEvent } from '../../events';
import { QuestionResponseDto } from '../../dtos';
import { QuestionType, Difficulty, Prisma } from '@prisma/client';

@Injectable()
@CommandHandler(CreateQuestionCommand)
export class CreateQuestionHandler implements ICommandHandler<CreateQuestionCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateQuestionCommand): Promise<QuestionResponseDto> {
    const {
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

    if (subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!subject) {
        throw new NotFoundException('Subject not found');
      }
      if (subject.teacherId !== teacherId) {
        throw new NotFoundException('Subject not found');
      }
    }

    if (topicId) {
      const topic = await this.prisma.topic.findUnique({
        where: { id: topicId },
      });
      if (!topic) {
        throw new NotFoundException('Topic not found');
      }
    }

    const question = await this.prisma.question.create({
      data: {
        teacherId,
        title,
        content,
        questionType: questionType as QuestionType,
        typeConfig: typeConfig as Prisma.InputJsonValue,
        subjectId: subjectId || null,
        topicId: topicId || null,
        difficulty: (difficulty as Difficulty) || Difficulty.medium,
        estimatedTimeMinutes: estimatedTimeMinutes || null,
        tags: tags || [],
        weight: weight || 1,
      },
    });

    this.eventBus.publish(
      new QuestionCreatedEvent(question.id, teacherId, question.title),
    );

    return {
      id: question.id,
      teacherId: question.teacherId,
      subjectId: question.subjectId,
      topicId: question.topicId,
      title: question.title,
      content: question.content,
      questionType: question.questionType,
      typeConfig: question.typeConfig as Record<string, unknown>,
      difficulty: question.difficulty,
      estimatedTimeMinutes: question.estimatedTimeMinutes,
      tags: question.tags,
      weight: question.weight,
      timesUsed: question.timesUsed,
      averageScore: question.averageScore,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
