import { Controller, Get, Param } from '@nestjs/common';
import { BlogService } from './blog.service.js';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  list() {
    return this.blogService.listPublished();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.blogService.getBySlug(slug);
  }
}
