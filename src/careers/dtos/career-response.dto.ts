import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CareerResponseDto {
  @ApiProperty({
    description: 'ID único de la carrera',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la carrera',
    example: 'Ingeniería en Sistemas',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Código de la carrera',
    example: 'ISC',
    nullable: true,
  })
  code: string | null;

  @ApiProperty({
    description: 'Estado activo de la carrera',
    example: true,
  })
  isActive: boolean;

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
