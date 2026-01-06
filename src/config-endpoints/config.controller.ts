import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExamDefaultConfigDto } from '../exams/dtos';
import { PrismaService } from '../prisma';
import { CurrentUser } from '../auth/decorators';
import type { JwtUser } from '../auth/interfaces';

const DEFAULT_EXAM_CONFIG: ExamDefaultConfigDto = {
  shuffleQuestions: false,
  shuffleOptions: true,
  showResultsImmediately: false,
  penaltyEnabled: false,
  penaltyValue: 0.25,
  passingPercentage: 60,
};

@ApiTags('config')
@ApiBearerAuth('JWT-auth')
@Controller('config')
export class ConfigController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('exam-defaults')
  @ApiOperation({
    summary: 'Obtener configuración por defecto de exámenes',
    description:
      'Retorna la configuración del último examen actualizado del profesor, o valores por defecto si no tiene exámenes',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración por defecto',
    type: ExamDefaultConfigDto,
  })
  async getExamDefaults(@CurrentUser() user: JwtUser): Promise<ExamDefaultConfigDto> {
    const lastExam = await this.prisma.exam.findFirst({
      where: { teacherId: user.id },
      orderBy: { updatedAt: 'desc' },
      select: { config: true },
    });

    if (!lastExam || !lastExam.config) {
      return DEFAULT_EXAM_CONFIG;
    }

    const config = lastExam.config as Record<string, unknown>;

    return {
      shuffleQuestions: typeof config.shuffleQuestions === 'boolean'
        ? config.shuffleQuestions
        : DEFAULT_EXAM_CONFIG.shuffleQuestions,
      shuffleOptions: typeof config.shuffleOptions === 'boolean'
        ? config.shuffleOptions
        : DEFAULT_EXAM_CONFIG.shuffleOptions,
      showResultsImmediately: typeof config.showResultsImmediately === 'boolean'
        ? config.showResultsImmediately
        : DEFAULT_EXAM_CONFIG.showResultsImmediately,
      penaltyEnabled: typeof config.penaltyEnabled === 'boolean'
        ? config.penaltyEnabled
        : DEFAULT_EXAM_CONFIG.penaltyEnabled,
      penaltyValue: typeof config.penaltyValue === 'number'
        ? config.penaltyValue
        : DEFAULT_EXAM_CONFIG.penaltyValue,
      passingPercentage: typeof config.passingPercentage === 'number'
        ? config.passingPercentage
        : DEFAULT_EXAM_CONFIG.passingPercentage,
    };
  }
}
