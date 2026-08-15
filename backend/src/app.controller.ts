import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Get('api/v1/health')
  getHealth() {
    return {
      status: 'ok',
      service: 'PeriX Backend API',
      timestamp: new Date().toISOString(),
    };
  }
}
