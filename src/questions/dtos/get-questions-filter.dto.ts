import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { QuestionTypeEnum, DifficultyEnum } from './create-question.dto';

export class GetQuestionsFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de la asignatura',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  subjectId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del tema',
    format: 'uuid',
  })
  @IsString()
  @IsOptional()
  topicId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de pregunta',
    enum: QuestionTypeEnum,
  })
  @IsEnum(QuestionTypeEnum)
  @IsOptional()
  type?: QuestionTypeEnum;

  @ApiPropertyOptional({
    description: 'Filtrar por dificultad',
    enum: DifficultyEnum,
  })
  @IsEnum(DifficultyEnum)
  @IsOptional()
  difficulty?: DifficultyEnum;
}
