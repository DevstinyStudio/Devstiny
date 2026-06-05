import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Badges ────────────────────────────────────────────────────────────────

  async createBadge(data: { key: string; name: string; description?: string }) {
    return this.prisma.badge.create({ data: { key: data.key, name: data.name, description: data.description ?? '' } });
  }

  async updateBadge(id: string, data: { name?: string; description?: string }) {
    const badge = await this.prisma.badge.findUnique({ where: { id } });
    if (!badge) throw new NotFoundException('Badge not found.');
    return this.prisma.badge.update({ where: { id }, data });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async getStats() {
    const [players, threads, replies, categories] = await Promise.all([
      this.prisma.player.count(),
      this.prisma.forumThread.count(),
      this.prisma.forumReply.count(),
      this.prisma.forumCategory.count(),
    ]);
    return { players, threads, replies, categories };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  async listUsers(page = 1, limit = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' as const } },
            { email:    { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [players, total] = await Promise.all([
      this.prisma.player.findMany({
        where,
        select: {
          id:        true,
          username:  true,
          email:     true,
          role:      true,
          createdAt: true,
          progress: { select: { xp: true, gold: true, completedChapters: true } },
          _count:    { select: { forumThreads: true, forumReplies: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.player.count({ where }),
    ]);

    return { players, total, page, limit };
  }

  async updateUser(id: string, role: string) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundException('Player not found.');
    if (!['USER', 'ADMIN'].includes(role)) throw new BadRequestException('Invalid role.');

    return this.prisma.player.update({
      where: { id },
      data:  { role },
      select: { id: true, username: true, email: true, role: true },
    });
  }

  async deleteUser(id: string) {
    const player = await this.prisma.player.findUnique({ where: { id } });
    if (!player) throw new NotFoundException('Player not found.');

    // Delete in order to satisfy FK constraints
    await this.prisma.$transaction([
      this.prisma.forumReply.deleteMany({ where: { authorId: id } }),
      this.prisma.forumThread.deleteMany({ where: { authorId: id } }),
      this.prisma.playerBadge.deleteMany({ where: { playerId: id } }),
      this.prisma.playerCompanion.deleteMany({ where: { playerId: id } }),
      this.prisma.progress.deleteMany({ where: { playerId: id } }),
      this.prisma.player.delete({ where: { id } }),
    ]);

    return { success: true };
  }

  // ── Forum Categories ──────────────────────────────────────────────────────

  async listCategories() {
    return this.prisma.forumCategory.findMany({ orderBy: { order: 'asc' } });
  }

  async createCategory(data: {
    slug: string;
    title: string;
    description: string;
    gem: string;
    color: string;
    order?: number;
  }) {
    const existing = await this.prisma.forumCategory.findUnique({
      where: { slug: data.slug },
    });
    if (existing) throw new BadRequestException('Slug already exists.');

    return this.prisma.forumCategory.create({ data });
  }

  async updateCategory(
    id: string,
    data: Partial<{
      slug: string;
      title: string;
      description: string;
      gem: string;
      color: string;
      order: number;
    }>,
  ) {
    const cat = await this.prisma.forumCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found.');

    return this.prisma.forumCategory.update({ where: { id }, data });
  }

  async deleteCategory(id: string) {
    const cat = await this.prisma.forumCategory.findUnique({ where: { id } });
    if (!cat) throw new NotFoundException('Category not found.');

    return this.prisma.forumCategory.delete({ where: { id } });
  }

  // ── Costume Tiers ─────────────────────────────────────────────────────────

  async listCostumeTiers() {
    return this.prisma.costumeTier.findMany({ orderBy: { order: 'asc' } });
  }

  async updateCostumeTier(id: string, data: Partial<{ price: number; color: string; name: string }>) {
    const tier = await this.prisma.costumeTier.findUnique({ where: { id } });
    if (!tier) throw new NotFoundException('Tier not found.');
    return this.prisma.costumeTier.update({ where: { id }, data });
  }

  // ── Costume Configs ───────────────────────────────────────────────────────

  async listCostumeConfigs() {
    return this.prisma.costumeConfig.findMany({
      include: { tier: true },
      orderBy: { costumeId: 'asc' },
    });
  }

  async updateCostumeConfig(costumeId: number, data: { tierId?: string; isFree?: boolean }) {
    return this.prisma.costumeConfig.update({
      where: { costumeId },
      data,
      include: { tier: true },
    });
  }

  async bulkAssignTier(costumeIds: number[], tierId: string) {
    const tier = await this.prisma.costumeTier.findUnique({ where: { id: tierId } });
    if (!tier) throw new NotFoundException('Tier not found.');
    await this.prisma.$transaction(
      costumeIds.map((id) =>
        this.prisma.costumeConfig.update({ where: { costumeId: id }, data: { tierId } })
      )
    );
    return { success: true, updated: costumeIds.length };
  }

  async reorderCategories(orders: { id: string; order: number }[]) {
    await this.prisma.$transaction(
      orders.map(({ id, order }) =>
        this.prisma.forumCategory.update({ where: { id }, data: { order } }),
      ),
    );
    return { success: true };
  }
}
