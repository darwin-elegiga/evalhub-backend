import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UnauthorizedException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenCommand } from '../refresh-token.command';
import { PrismaService } from '../../../prisma';
import { TokenRefreshedEvent } from '../../events';
import { TokensDto } from '../../dtos';
import type { JwtPayload } from '../../interfaces';

@Injectable()
@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<TokensDto> {
    const { refreshToken } = command;

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    if (storedToken.isRevoked) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (new Date() > storedToken.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.email,
    );

    const newRefreshTokenRecord = await this.saveRefreshToken(
      storedToken.user.id,
      tokens.refreshToken,
    );

    this.eventBus.publish(
      new TokenRefreshedEvent(
        storedToken.user.id,
        storedToken.id,
        newRefreshTokenRecord.id,
      ),
    );

    return tokens;
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<TokensDto> {
    const accessExpiresInSeconds = 900;
    const refreshExpiresInSeconds = 604800;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email, type: 'access' },
        {
          secret: this.configService.get<string>('jwt.secret'),
          expiresIn: accessExpiresInSeconds,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: 'refresh' },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: refreshExpiresInSeconds,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    return this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }
}
