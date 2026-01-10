import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSubjectCommand } from '../create-subject.command';
import { PrismaService } from '../../../prisma';
import { SubjectCreatedEvent } from '../../events';
import { SubjectResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(CreateSubjectCommand)
export class CreateSubjectHandler implements ICommandHandler<CreateSubjectCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateSubjectCommand): Promise<SubjectResponseDto> {
    const { teacherId, name, description, color } = command;

    const existingSubject = await this.prisma.subject.findUnique({
      where: {
        teacherId_name: {
          teacherId,
          name,
        },
      },
    });

    if (existingSubject) {
      throw new ConflictException('Subject with this name already exists');
    }

    const subject = await this.prisma.subject.create({
      data: {
        teacherId,
        name,
        description,
        color,
      },
    });

    this.eventBus.publish(
      new SubjectCreatedEvent(subject.id, teacherId, subject.name),
    );

    return {
      id: subject.id,
      name: subject.name,
      description: subject.description,
      color: subject.color,
      createdAt: subject.createdAt,
      updatedAt: subject.updatedAt,
    };
  }
}
