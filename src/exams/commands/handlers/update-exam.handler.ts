import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UpdateExamCommand } from '../update-exam.command';
import { PrismaService } from '../../../prisma';
import { ExamUpdatedEvent } from '../../events';
import { ExamDetailResponseDto } from '../../dtos';
import { Prisma } from '@prisma/client';

@Injectable()
@CommandHandler(UpdateExamCommand)
export class UpdateExamHandler implements ICommandHandler<UpdateExamCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateExamCommand): Promise<ExamDetailResponseDto> {
    const {
      examId,
      teacherId,
      title,
      description,
      subjectId,
      durationMinutes,
      config,
      questions,
    } = command;

    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to update this exam',
      );
    }

    // Verify subject if provided
    if (subjectId !== undefined && subjectId !== null) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!subject || subject.teacherId !== teacherId) {
        throw new NotFoundException('Subject not found');
      }
    }

    // Verify questions if provided
    if (questions && questions.length > 0) {
      const questionIds = questions.map((q) => q.questionId);
      const existingQuestions = await this.prisma.question.findMany({
        where: {
          id: { in: questionIds },
          teacherId,
        },
        select: { id: true },
      });

      if (existingQuestions.length !== questionIds.length) {
        throw new NotFoundException('One or more questions not found');
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const updatedExam = await tx.exam.update({
        where: { id: examId },
        data: {
          title: title ?? undefined,
          description: description !== undefined ? description : undefined,
          subjectId: subjectId !== undefined ? subjectId : undefined,
          durationMinutes:
            durationMinutes !== undefined ? durationMinutes : undefined,
          config: config
            ? (config as unknown as Prisma.InputJsonValue)
            : undefined,
        },
      });

      // If questions are provided, replace all existing questions
      if (questions) {
        await tx.examQuestion.deleteMany({
          where: { examId },
        });

        await Promise.all(
          questions.map((q) =>
            tx.examQuestion.create({
              data: {
                examId,
                questionId: q.questionId,
                questionOrder: q.questionOrder,
                weight: q.weight,
              },
            }),
          ),
        );
      }

      const examWithQuestions = await tx.exam.findUnique({
        where: { id: examId },
        include: {
          questions: {
            orderBy: { questionOrder: 'asc' },
            include: { question: true },
          },
        },
      });

      return examWithQuestions!;
    });

    this.eventBus.publish(new ExamUpdatedEvent(examId, teacherId));

    const configData = result.config as Record<string, unknown>;

    return {
      id: result.id,
      teacherId: result.teacherId,
      subjectId: result.subjectId,
      title: result.title,
      description: result.description,
      durationMinutes: result.durationMinutes,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      config: {
        shuffleQuestions: (configData.shuffleQuestions as boolean) ?? false,
        shuffleOptions: (configData.shuffleOptions as boolean) ?? false,
        showResultsImmediately:
          (configData.showResultsImmediately as boolean) ?? true,
        allowReview: (configData.allowReview as boolean) ?? true,
        penaltyPerWrongAnswer:
          (configData.penaltyPerWrongAnswer as number) ?? null,
        passingPercentage: (configData.passingPercentage as number) ?? 60,
      },
      questions: result.questions.map((eq) => ({
        id: eq.id,
        examId: eq.examId,
        questionId: eq.questionId,
        questionOrder: eq.questionOrder,
        weight: eq.weight,
        question: eq.question as unknown as Record<string, unknown>,
      })),
    };
  }
}
