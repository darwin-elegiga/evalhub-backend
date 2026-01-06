import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentGroupResponseDto {
  @ApiProperty({
    description: 'ID único del grupo',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del grupo',
    example: 'Grupo A',
  })
  name: string;
}

export class StudentResponseDto {
  @ApiProperty({
    description: 'ID único del estudiante',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre completo del estudiante',
    example: 'Juan Pérez García',
  })
  fullName: string;

  @ApiProperty({
    description: 'Email del estudiante',
    example: 'estudiante@ejemplo.com',
    format: 'email',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Año académico',
    example: '2024',
    nullable: true,
  })
  year: string | null;

  @ApiPropertyOptional({
    description: 'Carrera del estudiante',
    example: 'Ingeniería en Sistemas',
    nullable: true,
  })
  career: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Grupos a los que pertenece el estudiante',
    type: [StudentGroupResponseDto],
  })
  groups?: StudentGroupResponseDto[];
}
