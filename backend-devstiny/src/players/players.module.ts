import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { PlayersController } from './players.controller.js';
import { PlayersService } from './players.service.js';

@Module({
  providers: [PlayersService, JwtAuthGuard],
  controllers: [PlayersController],
})
export class PlayersModule {}
