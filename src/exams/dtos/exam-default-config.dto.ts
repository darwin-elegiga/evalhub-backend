import { ApiProperty } from '@nestjs/swagger';

export class ExamDefaultConfigDto {
  @ApiProperty({
    description: 'Mezclar el orden de las preguntas por defecto',
    example: false,
  })
  shuffleQuestions: boolean;

  @ApiProperty({
    description: 'Mezclar las opciones de respuesta por defecto',
    example: true,
  })
  shuffleOptions: boolean;

  @ApiProperty({
    description: 'Mostrar resultados inmediatamente al terminar',
    example: false,
  })
  showResultsImmediately: boolean;

  @ApiProperty({
    description: 'Aplicar penalización por respuestas incorrectas',
    example: false,
  })
  penaltyEnabled: boolean;

  @ApiProperty({
    description: 'Valor de penalización (porcentaje decimal)',
    example: 0.25,
  })
  penaltyValue: number;

  @ApiProperty({
    description: 'Porcentaje mínimo para aprobar',
    example: 60,
  })
  passingPercentage: number;
}
