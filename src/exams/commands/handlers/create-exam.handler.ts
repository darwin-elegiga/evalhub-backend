import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CreateExamCommand } from '../create-exam.command';
import { PrismaService } from '../../../prisma';
import { ExamCreatedEvent } from '../../events';
import { CreateExamResponseDto } from '../../dtos';
import { Prisma } from '@prisma/client';

@Injectable()
@CommandHandler(CreateExamCommand)
export class CreateExamHandler implements ICommandHandler<CreateExamCommand> {
  private readonly logger = new Logger(CreateExamHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateExamCommand): Promise<CreateExamResponseDto> {
    const {
      teacherId,
      title,
      config,
      questions,
      description,
      subjectId,
      durationMinutes,
    } = command;

    this.logger.debug(
      `Creating exam for teacher ${teacherId} with ${questions?.length || 0} questions`,
    );

    if (!questions || questions.length === 0) {
      throw new BadRequestException('Exam must have at least one question');
    }

    // Verify all questions exist and belong to the teacher
    const questionIds = questions.map((q) => q.questionId);
    const existingQuestions = await this.prisma.question.findMany({
      where: {
        id: { in: questionIds },
        teacherId,
      },
      select: { id: true },
    });

    this.logger.debug(
      `Found ${existingQuestions.length} of ${questionIds.length} questions`,
    );

    if (existingQuestions.length !== questionIds.length) {
      const foundIds = existingQuestions.map((q) => q.id);
      const missingIds = questionIds.filter((id) => !foundIds.includes(id));
      this.logger.warn(
        `Questions not found or not owned by teacher: ${missingIds.join(', ')}`,
      );
      throw new NotFoundException(
        `One or more questions not found: ${missingIds.join(', ')}`,
      );
    }

    // Verify subject exists if provided
    if (subjectId) {
      const subject = await this.prisma.subject.findUnique({
        where: { id: subjectId },
      });
      if (!subject) {
        throw new NotFoundException(`Subject not found: ${subjectId}`);
      }
      if (subject.teacherId !== teacherId) {
        throw new NotFoundException(
          `Subject not owned by teacher: ${subjectId}`,
        );
      }
    }

    // Create exam with questions in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const exam = await tx.exam.create({
        data: {
          teacherId,
          title,
          description: description || null,
          subjectId: subjectId || null,
          durationMinutes: durationMinutes || null,
          config: config as unknown as Prisma.InputJsonValue,
        },
      });

      const examQuestions = await Promise.all(
        questions.map((q) =>
          tx.examQuestion.create({
            data: {
              examId: exam.id,
              questionId: q.questionId,
              questionOrder: q.questionOrder,
              weight: q.weight,
            },
          }),
        ),
      );

      return { exam, examQuestions };
    });

    this.eventBus.publish(
      new ExamCreatedEvent(result.exam.id, teacherId, result.exam.title),
    );

    return {
      exam: {
        id: result.exam.id,
        teacherId: result.exam.teacherId,
        subjectId: result.exam.subjectId,
        title: result.exam.title,
        description: result.exam.description,
        durationMinutes: result.exam.durationMinutes,
        createdAt: result.exam.createdAt,
        updatedAt: result.exam.updatedAt,
      },
      questions: result.examQuestions.map((eq) => ({
        id: eq.id,
        examId: eq.examId,
        questionId: eq.questionId,
        questionOrder: eq.questionOrder,
        weight: eq.weight,
      })),
    };
  }
}
