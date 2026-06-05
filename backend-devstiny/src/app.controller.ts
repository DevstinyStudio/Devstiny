import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('settings')
  getPublicSettings() {
    return this.appService.getPublicSettings();
  }

  @Get('stats')
  getSiteStats() {
    return this.appService.getSiteStats();
  }

  @Get('badges')
  getBadges() {
    return this.appService.getBadges();
  }

  @Get('costume-configs')
  getCostumeConfigs() {
    return this.appService.getCostumeConfigs();
  }
}
