import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExamQuestionInputDto, ExamConfigInputDto } from './create-exam.dto';

export class UpdateExamDto {
  @ApiPropertyOptional({
    description: 'Título del examen',
    example: 'Examen Parcial 1',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción del examen',
    example: 'Examen sobre los temas 1-3',
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'ID de la asignatura',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  subjectId?: string | null;

  @ApiPropertyOptional({
    description: 'Duración del examen en minutos',
    example: 60,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  durationMinutes?: number | null;

  @ApiPropertyOptional({
    description: 'Configuración del examen',
    type: ExamConfigInputDto,
  })
  @IsObject()
  @IsOptional()
  config?: ExamConfigInputDto;

  @ApiPropertyOptional({
    description: 'Preguntas del examen (reemplaza todas las existentes)',
    type: [ExamQuestionInputDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionInputDto)
  @IsOptional()
  questions?: ExamQuestionInputDto[];
}
