import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished() {
    return this.prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async listAll() {
    return this.prisma.blogPost.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async getBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found.');
    return post;
  }

  async getById(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found.');
    return post;
  }

  async create(data: {
    slug: string; title: string; excerpt: string; body?: unknown;
    author?: string; tag?: string; gem?: string;
    readTime?: number; isPublished?: boolean; order?: number;
  }) {
    return this.prisma.blogPost.create({ data: data as never });
  }

  async update(id: string, data: Partial<{
    slug: string; title: string; excerpt: string; body: unknown;
    author: string; tag: string; gem: string;
    readTime: number; isPublished: boolean; order: number;
  }>) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found.');
    return this.prisma.blogPost.update({ where: { id }, data: data as never });
  }

  async delete(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found.');
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
