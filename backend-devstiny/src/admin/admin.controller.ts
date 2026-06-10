import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard.js';
import { AdminService } from './admin.service.js';
import { QuestsService } from '../quests/quests.service.js';
import { BooksService } from '../books/books.service.js';
import { PathService } from '../path/path.service.js';
import { BlogService } from '../blog/blog.service.js';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly questsService: QuestsService,
    private readonly booksService: BooksService,
    private readonly pathService: PathService,
    private readonly blogService: BlogService,
  ) {}

  // ── Badges ───────────────────────────────────────────────────────────────

  @Post('badges')
  createBadge(@Body() body: { key: string; name: string; description?: string }) {
    return this.adminService.createBadge(body);
  }

  @Patch('badges/:id')
  updateBadge(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.adminService.updateBadge(id, body);
  }

  // ── Stats ────────────────────────────────────────────────────────────────

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  // ── Users ────────────────────────────────────────────────────────────────

  @Get('users')
  listUsers(
    @Query('page')   page   = '1',
    @Query('limit')  limit  = '20',
    @Query('search') search?: string,
  ) {
    return this.adminService.listUsers(parseInt(page), parseInt(limit), search);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id') id: string,
    @Body() body: { role: string },
  ) {
    return this.adminService.updateUser(id, body.role);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ── Forum Categories ─────────────────────────────────────────────────────

  @Get('categories')
  listCategories() {
    return this.adminService.listCategories();
  }

  @Post('categories')
  createCategory(
    @Body() body: {
      slug: string; title: string; description: string;
      gem: string; color: string; order?: number;
    },
  ) {
    return this.adminService.createCategory(body);
  }

  @Patch('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() body: Partial<{
      slug: string; title: string; description: string;
      gem: string; color: string; order: number;
    }>,
  ) {
    return this.adminService.updateCategory(id, body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Patch('categories-order')
  reorderCategories(@Body() body: { orders: { id: string; order: number }[] }) {
    return this.adminService.reorderCategories(body.orders);
  }

  // ── Costume Tiers ────────────────────────────────────────────────────────

  @Get('costume-tiers')
  listCostumeTiers() {
    return this.adminService.listCostumeTiers();
  }

  @Patch('costume-tiers/:id')
  updateCostumeTier(
    @Param('id') id: string,
    @Body() body: Partial<{ price: number; color: string; name: string }>,
  ) {
    return this.adminService.updateCostumeTier(id, body);
  }

  // ── Costume Configs ──────────────────────────────────────────────────────

  @Get('costume-configs')
  listCostumeConfigs() {
    return this.adminService.listCostumeConfigs();
  }

  @Patch('costume-configs/:id')
  updateCostumeConfig(
    @Param('id') id: string,
    @Body() body: { tierId?: string; isFree?: boolean },
  ) {
    return this.adminService.updateCostumeConfig(parseInt(id), body);
  }

  @Post('costume-configs/bulk-tier')
  bulkAssignTier(@Body() body: { costumeIds: number[]; tierId: string }) {
    return this.adminService.bulkAssignTier(body.costumeIds, body.tierId);
  }

  // ── Quests ───────────────────────────────────────────────────────────────

  @Get('quests')
  async listQuests() {
    const { quests } = await this.questsService.listQuests(true, 1, 9999);
    return quests;
  }

  @Post('quests')
  createQuest(@Body() body: {
    id: string; slug: string; title: string; tier: number; character: string;
    loreHook: string; functionName: string; starterCode: string;
    concepts: string[]; testCases: unknown;
    rewardXp: number; rewardGold: number; rewardBadge: string;
    isActive?: boolean; order?: number;
  }) {
    return this.questsService.upsertQuest(body);
  }

  @Get('quests/stats')
  questStats() {
    return this.questsService.getStats();
  }

  @Get('quests/:id')
  getQuest(@Param('id') id: string) {
    return this.questsService.getQuestById(id);
  }

  @Patch('quests/:id')
  updateQuest(
    @Param('id') id: string,
    @Body() body: Partial<{
      title: string; tier: number; character: string; loreHook: string;
      rewardXp: number; rewardGold: number; rewardBadge: string;
      isActive: boolean; order: number;
    }>,
  ) {
    return this.questsService.updateQuest(id, body);
  }

  @Delete('quests/:id')
  deleteQuest(@Param('id') id: string) {
    return this.questsService.deleteQuest(id);
  }

  // ── Books ────────────────────────────────────────────────────────────────

  @Get('books')
  listBooks() {
    return this.booksService.listBooks(true);
  }

  @Get('books/stats')
  bookStats() {
    return this.booksService.getStats();
  }

  @Get('books/:id')
  getBook(@Param('id') id: string) {
    return this.booksService.getBookById(id);
  }

  @Post('books')
  createBook(@Body() body: {
    slug: string; volume: string; title: string; subtitle: string;
    author: string; description: string; color: string; border: string;
    icon?: string; coverImage?: string; defaultLang: string; status: string; order: number;
  }) {
    return this.booksService.createBook(body);
  }

  @Patch('books/:id')
  updateBook(
    @Param('id') id: string,
    @Body() body: Partial<{
      title: string; subtitle: string; author: string; description: string;
      color: string; border: string; icon: string; defaultLang: string;
      status: string; order: number;
    }>,
  ) {
    return this.booksService.updateBook(id, body);
  }

  @Delete('books/:id')
  deleteBook(@Param('id') id: string) {
    return this.booksService.deleteBook(id);
  }

  @Post('books/:bookId/chapters')
  createChapter(
    @Param('bookId') bookId: string,
    @Body() body: { title: string; topics: string[]; content: string; example?: string; order: number },
  ) {
    return this.booksService.createChapter(bookId, body);
  }

  @Patch('book-chapters/:id')
  updateChapter(
    @Param('id') id: string,
    @Body() body: Partial<{ title: string; topics: string[]; content: string; example: string; sections: unknown; order: number }>,
  ) {
    return this.booksService.updateChapter(id, body);
  }

  @Delete('book-chapters/:id')
  deleteChapter(@Param('id') id: string) {
    return this.booksService.deleteChapter(id);
  }

  // ── Path Chapters ────────────────────────────────────────────────────────

  @Get('path')
  listPathChapters() {
    return this.pathService.listChapters();
  }

  @Get('path/stats')
  pathStats() {
    return this.pathService.getStats();
  }

  @Get('path/:id')
  getPathChapter(@Param('id') id: string) {
    return this.pathService.getChapterById(id);
  }

  @Post('path')
  createPathChapter(@Body() body: {
    slug: string; title: string; realm?: string; order?: number; isLocked?: boolean;
    coverImage?: string; description?: string; openingNarrative?: string;
    worldContext?: string; archonIntro?: string; rewardXp?: number; rewardGold?: number;
    rewardBadge?: string; rewardTitle?: string; estimatedHours?: number;
    difficulty?: string; skills?: string[]; tags?: string[]; npcImage?: string;
    type?: string; typeColor?: string;
  }) {
    return this.pathService.createChapter(body);
  }

  @Patch('path/:id')
  updatePathChapter(
    @Param('id') id: string,
    @Body() body: Partial<{
      title: string; realm: string; order: number; isLocked: boolean;
      coverImage: string; description: string; openingNarrative: string;
      worldContext: string; archonIntro: string; rewardXp: number; rewardGold: number;
      rewardBadge: string; rewardTitle: string; estimatedHours: number;
      difficulty: string; skills: string[]; tags: string[]; npcImage: string;
      type: string; typeColor: string;
    }>,
  ) {
    return this.pathService.updateChapter(id, body);
  }

  @Delete('path/:id')
  deletePathChapter(@Param('id') id: string) {
    return this.pathService.deleteChapter(id);
  }

  @Post('path/:chapterId/acts')
  createPathAct(
    @Param('chapterId') chapterId: string,
    @Body() body: {
      slug: string; title: string; order?: number; description?: string;
      isFinalAct?: boolean; isLocked?: boolean; content?: unknown;
    },
  ) {
    return this.pathService.createAct(chapterId, body);
  }

  @Patch('path-acts/:id')
  updatePathAct(
    @Param('id') id: string,
    @Body() body: Partial<{
      slug: string; title: string; order: number; description: string;
      isFinalAct: boolean; isLocked: boolean; content: unknown;
    }>,
  ) {
    return this.pathService.updateAct(id, body);
  }

  @Delete('path-acts/:id')
  deletePathAct(@Param('id') id: string) {
    return this.pathService.deleteAct(id);
  }

  // ── Blog ─────────────────────────────────────────────────────────────────

  @Get('blog')
  listBlogPosts() {
    return this.blogService.listAll();
  }

  @Get('blog/:id')
  getBlogPost(@Param('id') id: string) {
    return this.blogService.getById(id);
  }

  @Post('blog')
  createBlogPost(@Body() body: {
    slug: string; title: string; excerpt: string; body?: unknown;
    author?: string; tag?: string; gem?: string;
    readTime?: number; isPublished?: boolean; order?: number;
  }) {
    return this.blogService.create(body);
  }

  @Patch('blog/:id')
  updateBlogPost(
    @Param('id') id: string,
    @Body() body: Partial<{
      slug: string; title: string; excerpt: string; body: unknown;
      author: string; tag: string; gem: string;
      readTime: number; isPublished: boolean; order: number;
    }>,
  ) {
    return this.blogService.update(id, body);
  }

  @Delete('blog/:id')
  deleteBlogPost(@Param('id') id: string) {
    return this.blogService.delete(id);
  }
}
