import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateStudentDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del estudiante',
    example: 'Juan Pérez García',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Full name must not exceed 200 characters' })
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Email del estudiante',
    example: 'estudiante@ejemplo.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Año académico del estudiante',
    example: '2024',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Year must not exceed 20 characters' })
  year?: string;

  @ApiPropertyOptional({
    description: 'Carrera del estudiante',
    example: 'Ingeniería en Sistemas',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Career must not exceed 100 characters' })
  career?: string;
}
