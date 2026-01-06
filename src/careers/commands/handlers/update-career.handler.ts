import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UpdateCareerCommand } from '../update-career.command';
import { PrismaService } from '../../../prisma';
import { CareerUpdatedEvent } from '../../events';
import { CareerResponseDto } from '../../dtos';

@Injectable()
@CommandHandler(UpdateCareerCommand)
export class UpdateCareerHandler
  implements ICommandHandler<UpdateCareerCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateCareerCommand): Promise<CareerResponseDto> {
    const { careerId, name, code, isActive } = command;

    const career = await this.prisma.career.findUnique({
      where: { id: careerId },
    });

    if (!career) {
      throw new NotFoundException('Career not found');
    }

    // Check name uniqueness if changing
    if (name && name !== career.name) {
      const existingByName = await this.prisma.career.findUnique({
        where: { name },
      });

      if (existingByName) {
        throw new ConflictException('Career with this name already exists');
      }
    }

    // Check code uniqueness if changing
    if (code !== undefined && code !== career.code) {
      if (code) {
        const existingByCode = await this.prisma.career.findUnique({
          where: { code },
        });

        if (existingByCode && existingByCode.id !== careerId) {
          throw new ConflictException('Career with this code already exists');
        }
      }
    }

    const updatedCareer = await this.prisma.career.update({
      where: { id: careerId },
      data: {
        name: name ?? undefined,
        code: code !== undefined ? code : undefined,
        isActive: isActive ?? undefined,
      },
    });

    this.eventBus.publish(new CareerUpdatedEvent(careerId));

    return {
      id: updatedCareer.id,
      name: updatedCareer.name,
      code: updatedCareer.code,
      isActive: updatedCareer.isActive,
      createdAt: updatedCareer.createdAt,
      updatedAt: updatedCareer.updatedAt,
    };
  }
}
