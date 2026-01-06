import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ExamConfigDto {
  @ApiProperty({
    description: 'Mezclar el orden de las preguntas',
    default: false,
  })
  @IsBoolean()
  shuffleQuestions: boolean;

  @ApiProperty({
    description: 'Mezclar las opciones de respuesta',
    default: false,
  })
  @IsBoolean()
  shuffleOptions: boolean;

  @ApiProperty({
    description: 'Mostrar resultados inmediatamente al terminar',
    default: true,
  })
  @IsBoolean()
  showResultsImmediately: boolean;

  @ApiProperty({
    description: 'Permitir revisión del examen después de terminarlo',
    default: true,
  })
  @IsBoolean()
  allowReview: boolean;

  @ApiPropertyOptional({
    description: 'Penalización por respuesta incorrecta (porcentaje)',
    example: 0.25,
    nullable: true,
  })
  @IsNumber()
  @IsOptional()
  penaltyPerWrongAnswer?: number | null;

  @ApiProperty({
    description: 'Porcentaje mínimo para aprobar',
    example: 60,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  passingPercentage: number;
}
