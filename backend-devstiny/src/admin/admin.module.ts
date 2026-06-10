import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { MediaController } from './media.controller.js';
import { SettingsController } from './settings.controller.js';
import { QuestsModule } from '../quests/quests.module.js';
import { BooksModule } from '../books/books.module.js';
import { PathModule } from '../path/path.module.js';
import { BlogModule } from '../blog/blog.module.js';

@Module({
  imports: [QuestsModule, BooksModule, PathModule, BlogModule],
  controllers: [AdminController, MediaController, SettingsController],
  providers: [AdminService],
})
export class AdminModule {}
