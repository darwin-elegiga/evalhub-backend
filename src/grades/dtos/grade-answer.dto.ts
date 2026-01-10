import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class GradeAnswerDto {
  @ApiProperty({
    description: 'Puntuación de la respuesta (2-5)',
    minimum: 2,
    maximum: 5,
    example: 4,
  })
  @IsInt()
  @Min(2)
  @Max(5)
  score: number;

  @ApiPropertyOptional({
    description: 'Retroalimentación para el estudiante',
    example: 'Buena respuesta, pero falta profundizar en el concepto.',
  })
  @IsOptional()
  @IsString()
  feedback?: string;
}
