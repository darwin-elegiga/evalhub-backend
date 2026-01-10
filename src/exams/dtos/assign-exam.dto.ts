import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export class AssignExamDto {
  @ApiProperty({
    description: 'ID del examen a asignar',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  examId: string;

  @ApiPropertyOptional({
    description: 'IDs de los estudiantes a los que asignar el examen',
    type: [String],
    format: 'uuid',
  })
  @ValidateIf((o) => !o.groupId)
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  studentIds?: string[];

  @ApiPropertyOptional({
    description:
      'ID del grupo al que asignar el examen (todos los estudiantes del grupo)',
    format: 'uuid',
  })
  @ValidateIf((o) => !o.studentIds || o.studentIds.length === 0)
  @IsUUID('4')
  @IsOptional()
  groupId?: string;
}

export class AssignmentResultDto {
  @ApiProperty({ format: 'uuid' })
  studentId: string;

  @ApiProperty({ description: 'Nombre completo del estudiante' })
  studentName: string;

  @ApiProperty({ description: 'Email del estudiante' })
  studentEmail: string;

  @ApiProperty({
    description: 'Token mágico para acceder al examen',
  })
  magicToken: string;

  @ApiProperty({
    description: 'Link mágico para acceder al examen',
  })
  magicLink: string;
}

export class AssignExamResponseDto {
  @ApiProperty({ type: [AssignmentResultDto] })
  assignments: AssignmentResultDto[];

  @ApiPropertyOptional({
    description: 'Cantidad de estudiantes omitidos (ya tenían asignación)',
  })
  skippedCount?: number;
}
