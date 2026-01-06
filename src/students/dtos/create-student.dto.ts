import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsUUID,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    description: 'Nombre completo del estudiante',
    example: 'Juan Pérez García',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(200, { message: 'Full name must not exceed 200 characters' })
  fullName: string;

  @ApiProperty({
    description: 'Email del estudiante',
    example: 'estudiante@ejemplo.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

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

  @ApiPropertyOptional({
    description: 'IDs de los grupos a los que asignar el estudiante',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  groupIds?: string[];
}
