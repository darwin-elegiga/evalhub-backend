import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { UpdateSubjectCommand } from '../update-subject.command';
import { PrismaService } from '../../../prisma';
import { SubjectUpdatedEvent } from '../../events';
import { SubjectResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(UpdateSubjectCommand)
export class UpdateSubjectHandler implements ICommandHandler<UpdateSubjectCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateSubjectCommand): Promise<SubjectResponseDto> {
    const { subjectId, teacherId, name, description, color } = command;

    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    if (subject.teacherId !== teacherId) {
      throw new ForbiddenException(
        'You do not have permission to update this subject',
      );
    }

    if (name && name !== subject.name) {
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
    }

    const updatedSubject = await this.prisma.subject.update({
      where: { id: subjectId },
      data: {
        name: name ?? undefined,
        description: description !== undefined ? description : undefined,
        color: color !== undefined ? color : undefined,
      },
    });

    this.eventBus.publish(new SubjectUpdatedEvent(subjectId, teacherId));

    return {
      id: updatedSubject.id,
      name: updatedSubject.name,
      description: updatedSubject.description,
      color: updatedSubject.color,
      createdAt: updatedSubject.createdAt,
      updatedAt: updatedSubject.updatedAt,
    };
  }
}
