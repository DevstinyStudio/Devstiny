import { Controller, Get, Param } from '@nestjs/common';
import { PathService } from './path.service.js';

@Controller('path')
export class PathController {
  constructor(private readonly pathService: PathService) {}

  @Get()
  listChapters() {
    return this.pathService.listChapters();
  }

  @Get(':chapterSlug/acts')
  getActList(@Param('chapterSlug') chapterSlug: string) {
    return this.pathService.getActList(chapterSlug);
  }

  @Get(':chapterSlug/:actSlug')
  getAct(
    @Param('chapterSlug') chapterSlug: string,
    @Param('actSlug') actSlug: string,
  ) {
    return this.pathService.getAct(chapterSlug, actSlug);
  }

  @Get(':slug')
  getChapter(@Param('slug') slug: string) {
    return this.pathService.getChapter(slug);
  }
}
