import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  async listBooks(includeComingSoon = true) {
    return this.prisma.book.findMany({
      where: includeComingSoon ? {} : { status: 'available' },
      include: { chapters: { orderBy: { order: 'asc' }, select: { id: true, title: true, topics: true, order: true } } },
      orderBy: { order: 'asc' },
    });
  }

  async getBook(slug: string) {
    const book = await this.prisma.book.findUnique({
      where: { slug },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });
    if (!book) throw new NotFoundException('Book not found.');
    return book;
  }

  async getBookById(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });
    if (!book) throw new NotFoundException('Book not found.');
    return book;
  }

  async createBook(data: {
    slug: string; volume: string; title: string; subtitle: string;
    author: string; description: string; color: string; border: string;
    icon?: string; coverImage?: string; defaultLang: string; status: string; order: number;
  }) {
    const { slug, volume, title, subtitle, author, description, color, border,
            icon, coverImage, defaultLang, status, order } = data;
    return this.prisma.book.create({
      data: { slug, volume, title, subtitle, author, description, color, border,
              ...(icon !== undefined && { icon }),
              ...(coverImage !== undefined && { coverImage }),
              defaultLang, status, order },
      include: { chapters: true },
    });
  }

  async updateBook(id: string, data: Partial<{
    title: string; subtitle: string; author: string; description: string;
    color: string; border: string; icon: string; coverImage: string;
    defaultLang: string; status: string; order: number; volume: string;
  }>) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found.');
    return this.prisma.book.update({ where: { id }, data });
  }

  async updateChapter(id: string, data: Partial<{
    title: string; topics: string[]; content: string; example: string;
    sections: unknown; order: number;
  }>) {
    const ch = await this.prisma.bookChapter.findUnique({ where: { id } });
    if (!ch) throw new NotFoundException('Chapter not found.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.bookChapter.update({ where: { id }, data: data as any });
  }

  async createChapter(bookId: string, data: {
    title: string; topics: string[]; content?: string; example?: string;
    sections?: unknown; order: number;
  }) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.bookChapter.create({ data: { ...(data as any), bookId } });
  }

  async deleteBook(id: string) {
    const book = await this.prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundException('Book not found.');
    return this.prisma.book.delete({ where: { id } });
  }

  async deleteChapter(id: string) {
    const ch = await this.prisma.bookChapter.findUnique({ where: { id } });
    if (!ch) throw new NotFoundException('Chapter not found.');
    return this.prisma.bookChapter.delete({ where: { id } });
  }

  async getStats() {
    const [books, chapters, available] = await Promise.all([
      this.prisma.book.count(),
      this.prisma.bookChapter.count(),
      this.prisma.book.count({ where: { status: 'available' } }),
    ]);
    return { books, chapters, available };
  }
}
