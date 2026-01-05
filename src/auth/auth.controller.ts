import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import {
  RegisterUserCommand,
  LoginUserCommand,
  RefreshTokenCommand,
  LogoutUserCommand,
} from './commands';
import { GetCurrentUserQuery } from './queries';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  TokensDto,
  UserResponseDto,
} from './dtos';
import { Public } from './decorators';
import { CurrentUser } from './decorators';
import type { JwtUser } from './interfaces';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea una nueva cuenta de usuario con email y contraseña. Retorna los tokens de autenticación.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
  })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.commandBus.execute(
      new RegisterUserCommand(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
      ),
    );
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario con email y contraseña. Retorna access token y refresh token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas o cuenta desactivada',
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ipAddress =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return this.commandBus.execute(
      new LoginUserCommand(dto.email, dto.password, ipAddress, userAgent),
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar tokens',
    description:
      'Obtiene nuevos access token y refresh token usando un refresh token válido. El refresh token anterior será invalidado.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: 'Tokens renovados exitosamente',
    type: TokensDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido, expirado o revocado',
  })
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<TokensDto> {
    return this.commandBus.execute(new RefreshTokenCommand(dto.refreshToken));
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Invalida el refresh token proporcionado. Requiere autenticación con access token.',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 204,
    description: 'Sesión cerrada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado o token inválido',
  })
  @ApiResponse({
    status: 404,
    description: 'Refresh token no encontrado',
  })
  async logout(
    @CurrentUser() user: JwtUser,
    @Body() dto: RefreshTokenDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new LogoutUserCommand(user.id, dto.refreshToken),
    );
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obtener usuario actual',
    description:
      'Retorna la información del usuario autenticado. Requiere access token válido.',
  })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado o token inválido',
  })
  async getCurrentUser(@CurrentUser() user: JwtUser): Promise<UserResponseDto> {
    return this.queryBus.execute(new GetCurrentUserQuery(user.id));
  }
}
