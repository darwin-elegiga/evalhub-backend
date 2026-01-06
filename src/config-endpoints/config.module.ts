import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [ConfigController],
})
export class ConfigEndpointsModule {}
