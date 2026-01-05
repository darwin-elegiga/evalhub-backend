import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public, CurrentUser } from './auth';
import type { JwtUser } from './auth/interfaces';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
  getProtected(@CurrentUser() user: JwtUser): { message: string; user: JwtUser } {
    return {
      message: 'This is a protected route',
      user,
    };
  }
}
