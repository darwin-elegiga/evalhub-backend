import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TopicResponseDto {
  @ApiProperty({
    description: 'ID único del tema',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID del profesor',
    example: '550e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  teacherId: string;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: '550e8400-e29b-41d4-a716-446655440002',
    format: 'uuid',
  })
  subjectId: string;

  @ApiProperty({
    description: 'Nombre del tema',
    example: 'Cinemática',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del tema',
    example: 'Movimiento rectilíneo, caída libre, tiro parabólico',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Color del tema',
    example: 'blue',
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:00:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;
}
