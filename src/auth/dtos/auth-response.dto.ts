import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokensDto {
  @ApiProperty({
    description: 'Access token JWT (expira en 15 minutos)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token JWT (expira en 7 días)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
    format: 'email',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Nombre del usuario',
    example: 'Juan',
    nullable: true,
  })
  firstName: string | null;

  @ApiPropertyOptional({
    description: 'Apellido del usuario',
    example: 'Pérez',
    nullable: true,
  })
  lastName: string | null;

  @ApiProperty({
    description: 'Estado de la cuenta del usuario',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación de la cuenta',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: Date;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Información del usuario autenticado',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Tokens de autenticación',
    type: TokensDto,
  })
  tokens: TokensDto;
}
