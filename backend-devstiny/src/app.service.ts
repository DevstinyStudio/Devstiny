import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service.js';

const SETTING_DEFAULTS: Record<string, string> = {
  site_title:       'Devstiny',
  site_subtitle:    'Level Up Your Coding Skills',
  site_description: 'The pixel-art RPG platform for learning to code. Complete quests, earn XP, and master programming.',
  site_logo:        '/ui/logo5.png',
  site_favicon:     '/favicon.ico',
};

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getBadges() {
    return this.prisma.badge.findMany({ orderBy: { key: 'asc' } });
  }

  async getCostumeConfigs() {
    return this.prisma.costumeConfig.findMany({
      include: { tier: true },
      orderBy: { costumeId: 'asc' },
    });
  }

  async getPublicSettings() {
    const rows = await this.prisma.siteSetting.findMany();
    const map: Record<string, string> = { ...SETTING_DEFAULTS };
    for (const row of rows) map[row.key] = row.value;
    return map;
  }

  async getSiteStats() {
    const [playerCount, allProgress, guildThreads] = await Promise.all([
      this.prisma.player.count(),
      this.prisma.progress.findMany({ select: { completedScenes: true } }),
      this.prisma.forumThread.count({ where: { category: 'guild-board' } }),
    ]);

    const questsDone = allProgress.reduce(
      (sum, p) => sum + p.completedScenes.filter((s) => s.startsWith('quest/')).length,
      0,
    );

    // 4 gear (Armor, Weapon, Helmet, Glove) + 7 scrolls (one per chapter boss battle)
    const totalItems = 4 + 7;

    return {
      adventurers: playerCount,
      questsDone,
      items: totalItems,
      guilds: guildThreads,
    };
  }
}
