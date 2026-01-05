import { registerAs } from '@nestjs/config';

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'default-secret-change-me',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
