import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, IsIn } from 'class-validator';

const VALID_COLORS = ['blue', 'green', 'red', 'purple', 'orange', 'pink', 'cyan', 'yellow', 'indigo', 'teal'] as const;

export class UpdateTopicDto {
  @ApiPropertyOptional({
    description: 'Nombre del tema',
    example: 'Cinemática Avanzada',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción del tema',
    example: 'Movimiento rectilíneo uniforme y variado',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Color del tema',
    example: 'green',
    enum: VALID_COLORS,
  })
  @IsString()
  @IsOptional()
  @IsIn(VALID_COLORS, { message: 'Color must be one of: blue, green, red, purple, orange, pink, cyan, yellow, indigo, teal' })
  color?: string;

  @ApiPropertyOptional({
    description: 'ID de la asignatura',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Subject ID must be a valid UUID' })
  @IsOptional()
  subjectId?: string;
}
