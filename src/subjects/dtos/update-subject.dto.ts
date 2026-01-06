import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSubjectDto {
  @ApiPropertyOptional({
    description: 'Nombre de la asignatura',
    example: 'Matemáticas I',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la asignatura',
    example: 'Curso introductorio de matemáticas',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Color de la asignatura (formato hexadecimal)',
    example: '#3498db',
    maxLength: 7,
  })
  @IsString()
  @IsOptional()
  @MaxLength(7, { message: 'Color must not exceed 7 characters' })
  color?: string;
}
