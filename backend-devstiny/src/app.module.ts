import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PlayersModule } from './players/players.module.js';
import { ForumModule } from './forum/forum.module.js';
import { AdminModule } from './admin/admin.module.js';
import { QuestsModule } from './quests/quests.module.js';
import { BooksModule } from './books/books.module.js';
import { PathModule } from './path/path.module.js';

@Module({
  imports: [PrismaModule, AuthModule, PlayersModule, ForumModule, AdminModule, QuestsModule, BooksModule, PathModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
