import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { PrismaService } from '../prisma/prisma.service.js';

const DEFAULTS: Record<string, string> = {
  site_title:       'Devstiny',
  site_subtitle:    'Level Up Your Coding Skills',
  site_description: 'The pixel-art RPG platform for learning to code. Complete quests, earn XP, and master programming.',
  site_logo:        '/ui/logo5.png',
  site_favicon:     '/favicon.ico',
};

@Controller('admin/settings')
@UseGuards(AdminGuard)
export class SettingsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async getSettings() {
    const rows = await this.prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    return map;
  }

  @Patch()
  async updateSettings(@Body() body: Record<string, string>) {
    const allowed = new Set(Object.keys(DEFAULTS));
    const ops = Object.entries(body)
      .filter(([k]) => allowed.has(k))
      .map(([key, value]) =>
        this.prisma.siteSetting.upsert({
          where:  { key },
          update: { value },
          create: { key, value },
        }),
      );
    await Promise.all(ops);
    return this.getSettings();
  }
}
