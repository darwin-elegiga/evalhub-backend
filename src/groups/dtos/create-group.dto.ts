import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Nombre del grupo',
    example: 'Grupo A',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Año del grupo',
    example: '2024',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: 'Year is required' })
  @MaxLength(20, { message: 'Year must not exceed 20 characters' })
  year: string;

  @ApiProperty({
    description: 'Carrera del grupo',
    example: 'Ingeniería en Sistemas',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Career is required' })
  @MaxLength(100, { message: 'Career must not exceed 100 characters' })
  career: string;
}
