import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class AssignExamDto {
  @ApiProperty({
    description: 'ID del examen a asignar',
    format: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  examId: string;

  @ApiProperty({
    description: 'IDs de los estudiantes a los que asignar el examen',
    type: [String],
    format: 'uuid',
  })
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds: string[];
}

export class AssignmentResultDto {
  @ApiProperty({ format: 'uuid' })
  studentId: string;

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
}
