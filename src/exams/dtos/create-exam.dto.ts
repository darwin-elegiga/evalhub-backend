import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExamQuestionInputDto {
  @ApiProperty({
    description: 'ID de la pregunta del banco',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Peso de la pregunta en el examen',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  weight: number;

  @ApiProperty({
    description: 'Orden de la pregunta en el examen',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  questionOrder: number;
}

export class ExamConfigInputDto {
  @ApiProperty({
    description: 'Mezclar el orden de las preguntas',
    default: false,
  })
  shuffleQuestions: boolean;

  @ApiProperty({
    description: 'Mezclar las opciones de respuesta',
    default: false,
  })
  shuffleOptions: boolean;

  @ApiProperty({
    description: 'Mostrar resultados inmediatamente al terminar',
    default: true,
  })
  showResultsImmediately: boolean;

  @ApiProperty({
    description: 'Permitir revisión del examen después de terminarlo',
    default: true,
  })
  allowReview: boolean;

  @ApiPropertyOptional({
    description: 'Penalización por respuesta incorrecta',
    example: 0.25,
    nullable: true,
  })
  @IsOptional()
  penaltyPerWrongAnswer?: number | null;

  @ApiProperty({
    description: 'Porcentaje mínimo para aprobar',
    example: 60,
  })
  passingPercentage: number;
}

export class CreateExamDto {
  @ApiProperty({
    description: 'Título del examen',
    example: 'Examen Parcial 1',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción del examen',
    example: 'Examen sobre los temas 1-3',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'ID de la asignatura',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Duración del examen en minutos',
    example: 60,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number;

  @ApiProperty({
    description: 'Configuración del examen',
    type: ExamConfigInputDto,
  })
  @IsObject()
  config: ExamConfigInputDto;

  @ApiProperty({
    description: 'Preguntas del examen',
    type: [ExamQuestionInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionInputDto)
  questions: ExamQuestionInputDto[];
}
