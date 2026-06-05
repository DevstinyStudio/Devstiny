import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const VALID_CATEGORIES = [
  'tavern',
  'oracle',
  'hall-of-champions',
  'guild-board',
];

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async listThreads(
    category?: string,
    page = 1,
    limit = 20,
    author?: string,
    sort = 'date',
    search?: string,
    solvedOnly = false,
  ) {
    const where: Record<string, unknown> = {};
    if (category && VALID_CATEGORIES.includes(category)) where.category = category;
    if (author) where.author = { username: author };
    if (solvedOnly) where.solved = true;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const orderBy =
      sort === 'views'   ? { views: 'desc' as const } :
      sort === 'replies' ? { replies: { _count: 'desc' as const } } :
                           { createdAt: 'desc' as const };

    const [threads, total] = await Promise.all([
      this.prisma.forumThread.findMany({
        where,
        include: {
          author: { select: { username: true, progress: { select: { costume: true } } } },
          _count: { select: { replies: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.forumThread.count({ where }),
    ]);
    return { threads, total, page, limit };
  }

  async getThread(id: string) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, username: true, progress: { select: { costume: true } } } },
        replies: {
          include: { author: { select: { username: true, progress: { select: { costume: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!thread) throw new NotFoundException('Thread not found.');

    // Increment views without blocking response
    this.prisma.forumThread
      .update({ where: { id }, data: { views: { increment: 1 } } })
      .catch(() => {});

    return thread;
  }

  async createThread(
    authorId: string,
    title: string,
    content: string,
    category: string,
  ) {
    if (!VALID_CATEGORIES.includes(category)) {
      throw new BadRequestException('Invalid category.');
    }
    return this.prisma.forumThread.create({
      data: { authorId, title, content, category },
      include: { author: { select: { username: true, progress: { select: { costume: true } } } } },
    });
  }

  async createReply(authorId: string, threadId: string, content: string) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) throw new NotFoundException('Thread not found.');

    return this.prisma.forumReply.create({
      data: { authorId, threadId, content },
      include: { author: { select: { username: true, progress: { select: { costume: true } } } } },
    });
  }

  async likeReply(replyId: string) {
    const reply = await this.prisma.forumReply.findUnique({
      where: { id: replyId },
    });
    if (!reply) throw new NotFoundException('Reply not found.');

    return this.prisma.forumReply.update({
      where: { id: replyId },
      data: { likes: { increment: 1 } },
      select: { id: true, likes: true },
    });
  }

  async toggleSolved(threadId: string, playerId: string) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) throw new NotFoundException('Thread not found.');
    if (thread.authorId !== playerId) {
      throw new ForbiddenException('Only the thread author can mark as solved.');
    }

    const updated = await this.prisma.forumThread.update({
      where: { id: threadId },
      data: { solved: !thread.solved },
      select: { id: true, solved: true },
    });

    return updated;
  }

  async pinReply(threadId: string, replyId: string, playerId: string) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id: threadId },
    });
    if (!thread) throw new NotFoundException('Thread not found.');
    if (thread.authorId !== playerId) {
      throw new ForbiddenException('Only the thread author can pin a reply.');
    }

    const reply = await this.prisma.forumReply.findUnique({ where: { id: replyId } });
    if (!reply) throw new NotFoundException('Reply not found.');

    // Toggle: if already pinned → unpin; otherwise unpin all then pin this one
    const alreadyPinned = reply.isAnswer;

    await this.prisma.forumReply.updateMany({
      where: { threadId },
      data: { isAnswer: false },
    });

    if (!alreadyPinned) {
      await this.prisma.forumReply.update({
        where: { id: replyId },
        data: { isAnswer: true },
      });
    }

    return { replyId, pinned: !alreadyPinned };
  }

  async getStats() {
    const [threadCount, replyCount] = await Promise.all([
      this.prisma.forumThread.count(),
      this.prisma.forumReply.count(),
    ]);
    return { threads: threadCount, posts: threadCount + replyCount };
  }

  // ── Category methods ──────────────────────────────────────────────────────

  async listCategories() {
    const categories = await this.prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
    });

    // Attach thread and post counts per category
    return Promise.all(
      categories.map(async (cat) => {
        const [threads, replies] = await Promise.all([
          this.prisma.forumThread.count({ where: { category: cat.slug } }),
          this.prisma.forumReply.count({ where: { thread: { category: cat.slug } } }),
        ]);
        return { ...cat, threads, posts: threads + replies };
      }),
    );
  }

  async getCategory(slug: string) {
    const category = await this.prisma.forumCategory.findUnique({
      where: { slug },
    });
    if (!category) throw new NotFoundException('Category not found.');

    const [threads, replies] = await Promise.all([
      this.prisma.forumThread.count({ where: { category: slug } }),
      this.prisma.forumReply.count({ where: { thread: { category: slug } } }),
    ]);

    return { ...category, threads, posts: threads + replies };
  }

  async getCategoryStats() {
    const categories = await this.prisma.forumCategory.findMany({
      orderBy: { order: 'asc' },
    });
    return Promise.all(
      categories.map(async (cat) => {
        const [threads, replies] = await Promise.all([
          this.prisma.forumThread.count({ where: { category: cat.slug } }),
          this.prisma.forumReply.count({ where: { thread: { category: cat.slug } } }),
        ]);
        return { category: cat.slug, threads, posts: threads + replies };
      }),
    );
  }
}
