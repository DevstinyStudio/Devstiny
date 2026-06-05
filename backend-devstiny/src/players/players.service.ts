import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async completeScene(
    playerId: string,
    sceneKey: string,
    xp: number,
    gold: number,
    chapterSlug?: string,
    chapterXp?: number,
    chapterGold?: number,
    badgeKey?: string,
  ) {
    const progress = await this.prisma.progress.findUnique({ where: { playerId } });
    if (!progress) throw new NotFoundException('Progress not found.');

    // Idempotent — jika sudah tercatat, return data saat ini
    if (progress.completedScenes.includes(sceneKey)) {
      return {
        completedScenes:   progress.completedScenes,
        completedChapters: progress.completedChapters,
        xp:   progress.xp,
        gold: progress.gold,
      };
    }

    const newScenes = [...progress.completedScenes, sceneKey];

    const newChapters =
      chapterSlug && !progress.completedChapters.includes(chapterSlug)
        ? [...progress.completedChapters, chapterSlug]
        : progress.completedChapters;

    const totalXp   = xp   + (chapterXp   ?? 0);
    const totalGold = gold + (chapterGold  ?? 0);

    const [updated] = await Promise.all([
      this.prisma.progress.update({
        where: { playerId },
        data: {
          completedScenes:   newScenes,
          completedChapters: newChapters,
          xp:   { increment: totalXp   },
          gold: { increment: totalGold },
        },
      }),
      // Award badge if provided and not already earned
      badgeKey ? this.awardBadgeByKey(playerId, badgeKey) : Promise.resolve(null),
    ]);

    return {
      completedScenes:   updated.completedScenes,
      completedChapters: updated.completedChapters,
      xp:   updated.xp,
      gold: updated.gold,
    };
  }

  private async awardBadgeByKey(playerId: string, badgeKey: string) {
    const badge = await this.prisma.badge.findUnique({ where: { key: badgeKey } });
    if (!badge) return;
    const existing = await this.prisma.playerBadge.findUnique({
      where: { playerId_badgeId: { playerId, badgeId: badge.id } },
    });
    if (existing) return;
    return this.prisma.playerBadge.create({ data: { playerId, badgeId: badge.id } });
  }

  async updateAccount(playerId: string, username?: string, password?: string) {
    const player = await this.prisma.player.findUnique({ where: { id: playerId } });
    if (!player) throw new NotFoundException('Player not found.');

    const data: Record<string, unknown> = {};

    if (username && username !== player.username) {
      const taken = await this.prisma.player.findUnique({ where: { username } });
      if (taken) throw new ConflictException('Username already taken.');
      data.username = username;
    }

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return { username: player.username };
    }

    const updated = await this.prisma.player.update({ where: { id: playerId }, data });
    return { username: updated.username };
  }

  async equipBadge(playerId: string, badgeName: string | null) {
    const progress = await this.prisma.progress.findUnique({ where: { playerId } });
    if (!progress) throw new NotFoundException('Progress not found.');

    const flags = (progress.flags as Record<string, unknown>) ?? {};
    const updated = await this.prisma.progress.update({
      where: { playerId },
      data: { flags: { ...flags, equippedBadge: badgeName ?? null } },
    });

    return { equippedBadge: (updated.flags as Record<string, unknown>)?.equippedBadge ?? null };
  }

  async findPublicProfile(username: string) {
    const player = await this.prisma.player.findUnique({
      where: { username },
      include: {
        progress: true,
        badges: { include: { badge: true } },
        _count: { select: { forumThreads: true, forumReplies: true } },
      },
    });
    if (!player) throw new NotFoundException('Player not found.');

    const xp               = player.progress?.xp   ?? 0;
    const gold             = player.progress?.gold ?? 0;
    const level            = Math.floor(xp / 1000) + 1;
    const xpToNext         = level * 1000;
    const completedScenes  = player.progress?.completedScenes  ?? [];
    const completedChapters = player.progress?.completedChapters ?? [];
    const questsCompleted  = completedScenes.filter((s) => s.startsWith('quest/')).length;
    const equippedBadge    = ((player.progress?.flags ?? {}) as Record<string, unknown>)?.equippedBadge as string ?? null;

    return {
      username:          player.username,
      role:              player.role,
      joinDate:          player.createdAt,
      xp,
      gold,
      level,
      xpToNext,
      questsCompleted,
      chaptersCleared:   completedChapters.length,
      completedChapters,
      completedScenes,
      equippedBadge,
      costume:           player.progress?.costume ?? '1',
      badges:            player.badges.map((pb) => pb.badge),
      forumThreads:      player._count.forumThreads,
      forumReplies:      player._count.forumReplies,
    };
  }

  async findMe(playerId: string) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      include: {
        progress: true,
        badges: { include: { badge: true } },
      },
    });

    if (!player) throw new NotFoundException('Player not found.');

    const xp   = player.progress?.xp   ?? 0;
    const gold = player.progress?.gold ?? 0;
    const level    = Math.floor(xp / 1000) + 1;
    const xpToNext = level * 1000;

    let completedChapters = player.progress?.completedChapters ?? [];
    let completedScenes   = player.progress?.completedScenes   ?? [];
    let ownedCostumes     = await this.getMergedOwnedCostumes(player.progress?.ownedCostumes ?? []);

    // ── Admin preview: unlock everything for testing ──────────────────────────
    if (player.role === 'ADMIN') {
      const [chapters, acts, quests] = await Promise.all([
        this.prisma.pathChapter.findMany({ select: { slug: true } }),
        this.prisma.pathAct.findMany({
          select: { slug: true, chapter: { select: { slug: true } } },
        }),
        this.prisma.quest.findMany({ where: { isActive: true }, select: { slug: true } }),
      ]);

      completedChapters = chapters.map((c) => c.slug);
      completedScenes   = [
        ...acts.map((a) => `${a.chapter.slug}/${a.slug}`),
        ...quests.map((q) => `quest/${q.slug}`),
      ];
      ownedCostumes = Array.from({ length: 184 }, (_, i) => String(i + 1));
    }

    return {
      id: player.id,
      username: player.username,
      email: player.email,
      role: player.role,
      joinDate: player.createdAt,
      xp,
      gold,
      level,
      xpToNext,
      currentChapter: player.progress?.currentChapter ?? 'prologue',
      completedChapters,
      completedScenes,
      chaptersCleared: completedChapters.length,
      badges: player.badges.map((pb) => pb.badge),
      equippedBadge: ((player.progress?.flags ?? {}) as Record<string, unknown>)?.equippedBadge as string ?? null,
      flags: (player.progress?.flags ?? {}) as Record<string, unknown>,
      costume:      player.progress?.costume ?? '1',
      ownedCostumes,
    };
  }

  private async getMergedOwnedCostumes(owned: string[]): Promise<string[]> {
    const freeCostumes = await this.prisma.costumeConfig.findMany({
      where: { isFree: true },
      select: { costumeId: true },
    });
    const freeIds = freeCostumes.map((c) => String(c.costumeId));
    return [...new Set([...freeIds, ...owned])];
  }

  async buyCostume(playerId: string, costume: string) {
    const [progress, config] = await Promise.all([
      this.prisma.progress.findUnique({ where: { playerId } }),
      this.prisma.costumeConfig.findUnique({
        where: { costumeId: parseInt(costume) },
        include: { tier: true },
      }),
    ]);
    if (!progress) throw new NotFoundException('Progress not found.');

    const isFree = config?.isFree ?? false;
    const price  = isFree ? 0 : (config?.tier.price ?? 150);

    if (isFree || progress.ownedCostumes.includes(costume)) {
      return { success: true, gold: progress.gold, ownedCostumes: progress.ownedCostumes };
    }

    if (progress.gold < price) {
      throw new Error(`Not enough gold. Need ${price}G.`);
    }

    const updated = await this.prisma.progress.update({
      where: { playerId },
      data: {
        gold: { decrement: price },
        ownedCostumes: { push: costume },
      },
    });

    return { success: true, gold: updated.gold, ownedCostumes: updated.ownedCostumes };
  }

  async updateCostume(playerId: string, costume: string) {
    const progress = await this.prisma.progress.findUnique({ where: { playerId } });
    if (!progress) throw new NotFoundException('Progress not found.');
    await this.prisma.progress.update({ where: { playerId }, data: { costume } });
    return { costume };
  }
}
