import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { ForumService } from './forum.service.js';

@Controller('forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Get('stats')
  getStats() {
    return this.forumService.getStats();
  }

  @Get('categories')
  listCategories() {
    return this.forumService.listCategories();
  }

  @Get('categories/stats')
  getCategoryStats() {
    return this.forumService.getCategoryStats();
  }

  @Get('categories/:slug')
  getCategory(@Param('slug') slug: string) {
    return this.forumService.getCategory(slug);
  }

  @Get('threads')
  listThreads(
    @Query('category')   category?: string,
    @Query('page')       page      = '1',
    @Query('limit')      limit     = '20',
    @Query('author')     author?: string,
    @Query('sort')       sort      = 'date',
    @Query('search')     search?: string,
    @Query('solvedOnly') solvedOnly = 'false',
  ) {
    return this.forumService.listThreads(
      category,
      parseInt(page, 10),
      parseInt(limit, 10),
      author,
      sort,
      search,
      solvedOnly === 'true',
    );
  }

  @Get('threads/:id')
  getThread(@Param('id') id: string) {
    return this.forumService.getThread(id);
  }

  @Post('threads')
  @UseGuards(JwtAuthGuard)
  createThread(
    @Req() req: any,
    @Body() body: { title: string; content: string; category: string },
  ) {
    return this.forumService.createThread(
      req.user.sub,
      body.title,
      body.content,
      body.category,
    );
  }

  @Post('threads/:id/replies')
  @UseGuards(JwtAuthGuard)
  createReply(
    @Req() req: any,
    @Param('id') threadId: string,
    @Body() body: { content: string },
  ) {
    return this.forumService.createReply(req.user.sub, threadId, body.content);
  }

  @Post('replies/:id/like')
  @UseGuards(JwtAuthGuard)
  likeReply(@Param('id') replyId: string) {
    return this.forumService.likeReply(replyId);
  }

  @Patch('threads/:id/solve')
  @UseGuards(JwtAuthGuard)
  toggleSolved(@Req() req: any, @Param('id') threadId: string) {
    return this.forumService.toggleSolved(threadId, req.user.sub);
  }

  @Patch('threads/:id/pin')
  @UseGuards(JwtAuthGuard)
  pinReply(
    @Req() req: any,
    @Param('id') threadId: string,
    @Body() body: { replyId: string },
  ) {
    return this.forumService.pinReply(threadId, body.replyId, req.user.sub);
  }
}
