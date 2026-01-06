import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  IsUUID,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';

export class StudentItemDto {
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

export class CreateStudentsBatchDto {
  @ApiProperty({
    description: 'Lista de estudiantes a crear',
    type: [StudentItemDto],
    example: [
      {
        fullName: 'Juan Pérez García',
        email: 'juan@ejemplo.com',
        year: '2024',
        career: 'Ingeniería en Sistemas',
      },
      {
        fullName: 'María López',
        email: 'maria@ejemplo.com',
        year: '2024',
        career: 'Ingeniería en Sistemas',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'At least one student is required' })
  @Type(() => StudentItemDto)
  students: StudentItemDto[];
}

export class ImportStudentsCsvDto {
  @ApiProperty({
    description:
      'Contenido CSV con columnas: fullName, email, year (opcional), career (opcional). Primera fila debe ser el header.',
    example:
      'fullName,email,year,career\nJuan Pérez,juan@ejemplo.com,2024,Ingeniería\nMaría López,maria@ejemplo.com,2024,Ingeniería',
  })
  @IsString()
  @IsNotEmpty({ message: 'CSV content is required' })
  csv: string;

  @ApiPropertyOptional({
    description: 'IDs de los grupos a los que asignar todos los estudiantes',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  groupIds?: string[];
}

export class BatchResultDto {
  @ApiProperty({
    description: 'Número de estudiantes creados exitosamente',
    example: 10,
  })
  created: number;

  @ApiProperty({
    description: 'Número de estudiantes que fallaron',
    example: 2,
  })
  failed: number;

  @ApiProperty({
    description: 'Errores por cada estudiante que falló',
    example: [
      { row: 3, email: 'duplicado@ejemplo.com', error: 'Email already exists' },
    ],
  })
  errors: Array<{
    row: number;
    email?: string;
    fullName?: string;
    error: string;
  }>;

  @ApiProperty({
    description: 'Estudiantes creados exitosamente',
    type: [String],
  })
  createdIds: string[];
}
