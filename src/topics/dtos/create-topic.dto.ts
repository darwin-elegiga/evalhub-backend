import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, IsIn } from 'class-validator';

const VALID_COLORS = ['blue', 'green', 'red', 'purple', 'orange', 'pink', 'cyan', 'yellow', 'indigo', 'teal'] as const;

export class CreateTopicDto {
  @ApiProperty({
    description: 'Nombre del tema',
    example: 'Cinemática',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción del tema',
    example: 'Movimiento rectilíneo, caída libre, tiro parabólico',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Color del tema',
    example: 'blue',
    enum: VALID_COLORS,
  })
  @IsString()
  @IsOptional()
  @IsIn(VALID_COLORS, { message: 'Color must be one of: blue, green, red, purple, orange, pink, cyan, yellow, indigo, teal' })
  color?: string;

  @ApiProperty({
    description: 'ID de la asignatura',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Subject ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Subject ID is required' })
  subjectId: string;
}
