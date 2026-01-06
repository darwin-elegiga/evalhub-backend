import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GroupStudentResponseDto {
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
  })
  email: string;
}

export class GroupResponseDto {
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

  @ApiProperty({
    description: 'Año del grupo',
    example: '2024',
  })
  year: string;

  @ApiProperty({
    description: 'Carrera del grupo',
    example: 'Ingeniería en Sistemas',
  })
  career: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Estudiantes del grupo',
    type: [GroupStudentResponseDto],
  })
  students?: GroupStudentResponseDto[];

  @ApiPropertyOptional({
    description: 'Cantidad de estudiantes en el grupo',
    example: 25,
  })
  studentCount?: number;
}
