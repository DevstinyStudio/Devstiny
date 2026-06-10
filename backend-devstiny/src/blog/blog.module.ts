import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller.js';
import { BlogService } from './blog.service.js';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
