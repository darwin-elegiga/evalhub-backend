import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateCareerCommand } from '../create-career.command';
import { PrismaService } from '../../../prisma';
import { CareerCreatedEvent } from '../../events';
import { CareerResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(CreateCareerCommand)
export class CreateCareerHandler
  implements ICommandHandler<CreateCareerCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateCareerCommand): Promise<CareerResponseDto> {
    const { name, code } = command;

    // Check if career with same name exists
    const existingByName = await this.prisma.career.findUnique({
      where: { name },
    });

    if (existingByName) {
      throw new ConflictException('Career with this name already exists');
    }

    // Check if career with same code exists (if code provided)
    if (code) {
      const existingByCode = await this.prisma.career.findUnique({
        where: { code },
      });

      if (existingByCode) {
        throw new ConflictException('Career with this code already exists');
      }
    }

    const career = await this.prisma.career.create({
      data: {
        name,
        code,
      },
    });

    this.eventBus.publish(new CareerCreatedEvent(career.id, career.name));

    return {
      id: career.id,
      name: career.name,
      code: career.code,
      isActive: career.isActive,
      createdAt: career.createdAt,
      updatedAt: career.updatedAt,
    };
  }
}
