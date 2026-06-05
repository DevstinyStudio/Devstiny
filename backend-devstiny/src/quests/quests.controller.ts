import { Controller, Get, Param, Query } from '@nestjs/common';
import { QuestsService } from './quests.service.js';

@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Get()
  listQuests(
    @Query('page')  page  = '1',
    @Query('limit') limit = '9',
    @Query('tier')  tier?: string,
  ) {
    return this.questsService.listQuests(false, Number(page), Number(limit), tier ? Number(tier) : undefined);
  }

  @Get(':slug')
  getQuest(@Param('slug') slug: string) {
    return this.questsService.getQuest(slug);
  }
}
