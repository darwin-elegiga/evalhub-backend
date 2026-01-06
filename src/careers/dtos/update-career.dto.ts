import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCareerDto {
  @ApiPropertyOptional({
    description: 'Nombre de la carrera',
    example: 'Ingeniería en Sistemas',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Código de la carrera',
    example: 'ISC',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Code must not exceed 20 characters' })
  code?: string;

  @ApiPropertyOptional({
    description: 'Estado activo de la carrera',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
