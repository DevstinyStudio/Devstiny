import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class QuestsService {
  constructor(private readonly prisma: PrismaService) {}

  async listQuests(includeInactive = false, page = 1, limit = 9, tier?: number) {
    const where: Record<string, unknown> = includeInactive ? {} : { isActive: true };
    if (tier !== undefined) where.tier = tier;

    const [quests, total] = await Promise.all([
      this.prisma.quest.findMany({
        where,
        select: {
          id: true, slug: true, title: true, tier: true,
          character: true, loreHook: true, concepts: true,
          rewardXp: true, rewardGold: true, rewardBadge: true,
          isActive: true, order: true,
        },
        orderBy: [{ tier: 'asc' }, { order: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.quest.count({ where }),
    ]);

    return { quests, total, page, limit };
  }

  async getQuest(slug: string) {
    const quest = await this.prisma.quest.findUnique({ where: { slug } });
    if (!quest) throw new NotFoundException('Quest not found.');
    return quest;
  }

  async getQuestById(id: string) {
    const quest = await this.prisma.quest.findUnique({ where: { id } });
    if (!quest) throw new NotFoundException('Quest not found.');
    return quest;
  }

  async upsertQuest(data: {
    id: string; slug: string; title: string; tier: number; character: string;
    loreHook: string; functionName: string; starterCode: string;
    concepts: string[]; testCases: unknown;
    rewardXp: number; rewardGold: number; rewardBadge: string;
    isActive?: boolean; order?: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = { ...data, testCases: data.testCases as any };
    return this.prisma.quest.upsert({
      where: { id: data.id },
      update: payload,
      create: payload,
    });
  }

  async updateQuest(id: string, data: Partial<{
    title: string; tier: number; character: string; loreHook: string;
    functionName: string; starterCode: string; concepts: string[];
    testCases: unknown; rewardXp: number; rewardGold: number;
    rewardBadge: string; isActive: boolean; order: number;
  }>) {
    const quest = await this.prisma.quest.findUnique({ where: { id } });
    if (!quest) throw new NotFoundException('Quest not found.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.quest.update({ where: { id }, data: data as any });
  }

  async deleteQuest(id: string) {
    const quest = await this.prisma.quest.findUnique({ where: { id } });
    if (!quest) throw new NotFoundException('Quest not found.');
    return this.prisma.quest.delete({ where: { id } });
  }

  async getStats() {
    const [total, active] = await Promise.all([
      this.prisma.quest.count(),
      this.prisma.quest.count({ where: { isActive: true } }),
    ]);
    return { total, active };
  }
}
