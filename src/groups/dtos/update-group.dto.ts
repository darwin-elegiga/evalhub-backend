import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateGroupDto {
  @ApiPropertyOptional({
    description: 'Nombre del grupo',
    example: 'Grupo A',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Año del grupo',
    example: '2024',
    maxLength: 20,
  })
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Year must not exceed 20 characters' })
  year?: string;

  @ApiPropertyOptional({
    description: 'Carrera del grupo',
    example: 'Ingeniería en Sistemas',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Career must not exceed 100 characters' })
  career?: string;
}
