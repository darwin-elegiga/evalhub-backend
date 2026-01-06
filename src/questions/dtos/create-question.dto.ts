import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export enum QuestionTypeEnum {
  MULTIPLE_CHOICE = 'multiple_choice',
  NUMERIC = 'numeric',
  GRAPH_CLICK = 'graph_click',
  OPEN_TEXT = 'open_text',
}

export enum DifficultyEnum {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class CreateQuestionDto {
  @ApiPropertyOptional({
    description: 'ID de la asignatura',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'ID del tema',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  topicId?: string;

  @ApiProperty({
    description: 'Título de la pregunta',
    example: 'Derivada de función compuesta',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'Contenido de la pregunta (HTML)',
    example: '<p>Calcula la derivada de f(x) = sin(x²)</p>',
  })
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  content: string;

  @ApiProperty({
    description: 'Tipo de pregunta',
    enum: QuestionTypeEnum,
    example: 'multiple_choice',
  })
  @IsEnum(QuestionTypeEnum, { message: 'Invalid question type' })
  questionType: QuestionTypeEnum;

  @ApiProperty({
    description: 'Configuración específica del tipo de pregunta',
    example: {
      options: [
        { id: 'opt-1', text: '2x·cos(x²)', isCorrect: true, order: 1 },
        { id: 'opt-2', text: 'cos(x²)', isCorrect: false, order: 2 },
      ],
      allowMultiple: false,
      shuffleOptions: true,
    },
  })
  @IsObject()
  typeConfig: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Dificultad de la pregunta',
    enum: DifficultyEnum,
    default: 'medium',
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
  estimatedTimeMinutes?: number;

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
