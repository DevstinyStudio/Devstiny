import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class PathService {
  constructor(private readonly prisma: PrismaService) {}

  async listChapters() {
    return this.prisma.pathChapter.findMany({
      include: { acts: { orderBy: { order: 'asc' }, select: { id: true, slug: true, title: true, order: true, description: true, isFinalAct: true, isLocked: true } } },
      orderBy: { order: 'asc' },
    });
  }

  async getChapter(slug: string) {
    const chapter = await this.prisma.pathChapter.findUnique({
      where: { slug },
      include: { acts: { orderBy: { order: 'asc' }, select: { id: true, slug: true, title: true, order: true, description: true, isFinalAct: true, isLocked: true } } },
    });
    if (!chapter) throw new NotFoundException('Chapter not found.');
    return chapter;
  }

  async getChapterById(id: string) {
    const chapter = await this.prisma.pathChapter.findUnique({
      where: { id },
      include: { acts: { orderBy: { order: 'asc' } } },
    });
    if (!chapter) throw new NotFoundException('Chapter not found.');
    return chapter;
  }

  async getAct(chapterSlug: string, actSlug: string) {
    const chapter = await this.prisma.pathChapter.findUnique({ where: { slug: chapterSlug } });
    if (!chapter) throw new NotFoundException('Chapter not found.');
    const act = await this.prisma.pathAct.findUnique({
      where: { chapterId_slug: { chapterId: chapter.id, slug: actSlug } },
    });
    if (!act) throw new NotFoundException('Act not found.');
    return act;
  }

  async getActList(chapterSlug: string) {
    const chapter = await this.prisma.pathChapter.findUnique({ where: { slug: chapterSlug } });
    if (!chapter) throw new NotFoundException('Chapter not found.');
    return this.prisma.pathAct.findMany({
      where: { chapterId: chapter.id },
      orderBy: { order: 'asc' },
      select: { id: true, slug: true, title: true, order: true, description: true, isFinalAct: true, isLocked: true },
    });
  }

  async createChapter(data: {
    slug: string; title: string; realm?: string; order?: number; isLocked?: boolean;
    coverImage?: string; description?: string; openingNarrative?: string;
    worldContext?: string; archonIntro?: string; rewardXp?: number; rewardGold?: number;
    rewardBadge?: string; rewardTitle?: string; estimatedHours?: number;
    difficulty?: string; skills?: string[]; tags?: string[]; npcImage?: string;
    type?: string; typeColor?: string;
  }) {
    return this.prisma.pathChapter.create({
      data,
      include: { acts: true },
    });
  }

  async updateChapter(id: string, data: Partial<{
    title: string; realm: string; order: number; isLocked: boolean;
    coverImage: string; description: string; openingNarrative: string;
    worldContext: string; archonIntro: string; rewardXp: number; rewardGold: number;
    rewardBadge: string; rewardTitle: string; estimatedHours: number;
    difficulty: string; skills: string[]; tags: string[]; npcImage: string;
    type: string; typeColor: string;
  }>) {
    const chapter = await this.prisma.pathChapter.findUnique({ where: { id } });
    if (!chapter) throw new NotFoundException('Chapter not found.');
    return this.prisma.pathChapter.update({ where: { id }, data });
  }

  async deleteChapter(id: string) {
    const chapter = await this.prisma.pathChapter.findUnique({ where: { id } });
    if (!chapter) throw new NotFoundException('Chapter not found.');
    return this.prisma.pathChapter.delete({ where: { id } });
  }

  async createAct(chapterId: string, data: {
    slug: string; title: string; order?: number; description?: string;
    isFinalAct?: boolean; isLocked?: boolean; content?: unknown;
  }) {
    const chapter = await this.prisma.pathChapter.findUnique({ where: { id: chapterId } });
    if (!chapter) throw new NotFoundException('Chapter not found.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.pathAct.create({ data: { ...(data as any), chapterId } });
  }

  async updateAct(id: string, data: Partial<{
    slug: string; title: string; order: number; description: string;
    isFinalAct: boolean; isLocked: boolean; content: unknown;
  }>) {
    const act = await this.prisma.pathAct.findUnique({ where: { id } });
    if (!act) throw new NotFoundException('Act not found.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mergedData: any = { ...data };
    if (data.content && act.content && typeof act.content === 'object') {
      mergedData.content = { ...(act.content as object), ...(data.content as object) };
    }
    return this.prisma.pathAct.update({ where: { id }, data: mergedData });
  }

  async deleteAct(id: string) {
    const act = await this.prisma.pathAct.findUnique({ where: { id } });
    if (!act) throw new NotFoundException('Act not found.');
    return this.prisma.pathAct.delete({ where: { id } });
  }

  async getStats() {
    const [chapters, acts, locked] = await Promise.all([
      this.prisma.pathChapter.count(),
      this.prisma.pathAct.count(),
      this.prisma.pathChapter.count({ where: { isLocked: true } }),
    ]);
    return { chapters, acts, locked };
  }
}
