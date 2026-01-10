import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsInt, IsEnum, Min, Max } from 'class-validator';

export enum RoundingMethodDto {
  FLOOR = 'floor',
  CEIL = 'ceil',
  ROUND = 'round',
}

export class SubmitGradeDto {
  @ApiProperty({
    description: 'ID de la asignación a calificar',
    format: 'uuid',
  })
  @IsUUID('4')
  assignmentId: string;

  @ApiProperty({
    description: 'Promedio calculado de las respuestas',
    example: 3.75,
  })
  @IsNumber()
  @Min(2)
  @Max(5)
  averageScore: number;

  @ApiProperty({
    description: 'Calificación final (2-5)',
    minimum: 2,
    maximum: 5,
    example: 4,
  })
  @IsInt()
  @Min(2)
  @Max(5)
  finalGrade: number;

  @ApiProperty({
    description: 'Método de redondeo utilizado',
    enum: RoundingMethodDto,
    example: 'round',
  })
  @IsEnum(RoundingMethodDto)
  roundingMethod: RoundingMethodDto;
}
