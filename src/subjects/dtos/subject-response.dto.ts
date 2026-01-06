import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubjectResponseDto {
  @ApiProperty({
    description: 'ID único de la asignatura',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la asignatura',
    example: 'Matemáticas I',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la asignatura',
    example: 'Curso introductorio de matemáticas',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Color de la asignatura',
    example: '#3498db',
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: Date;
}
