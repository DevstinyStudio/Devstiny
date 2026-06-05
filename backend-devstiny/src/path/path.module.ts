import { Module } from '@nestjs/common';
import { PathController } from './path.controller.js';
import { PathService } from './path.service.js';

@Module({
  controllers: [PathController],
  providers: [PathService],
  exports: [PathService],
})
export class PathModule {}
