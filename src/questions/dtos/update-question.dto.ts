import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { QuestionTypeEnum, DifficultyEnum } from './create-question.dto';

export class UpdateQuestionDto {
  @ApiPropertyOptional({
    description: 'ID de la asignatura',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  subjectId?: string | null;

  @ApiPropertyOptional({
    description: 'ID del tema',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  topicId?: string | null;

  @ApiPropertyOptional({
    description: 'Título de la pregunta',
    example: 'Derivada de función compuesta',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Contenido de la pregunta (HTML)',
    example: '<p>Calcula la derivada de f(x) = sin(x²)</p>',
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({
    description: 'Tipo de pregunta',
    enum: QuestionTypeEnum,
  })
  @IsEnum(QuestionTypeEnum, { message: 'Invalid question type' })
  @IsOptional()
  questionType?: QuestionTypeEnum;

  @ApiPropertyOptional({
    description: 'Configuración específica del tipo de pregunta',
  })
  @IsObject()
  @IsOptional()
  typeConfig?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Dificultad de la pregunta',
    enum: DifficultyEnum,
  })
  @IsEnum(DifficultyEnum, { message: 'Invalid difficulty' })
  @IsOptional()
  difficulty?: DifficultyEnum;

  @ApiPropertyOptional({
    description: 'Tiempo estimado en minutos',
    example: 5,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  estimatedTimeMinutes?: number | null;

  @ApiPropertyOptional({
    description: 'Etiquetas de la pregunta',
    example: ['cálculo', 'derivadas'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Peso de la pregunta (1-10)',
    example: 5,
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  @IsOptional()
  weight?: number;
}
