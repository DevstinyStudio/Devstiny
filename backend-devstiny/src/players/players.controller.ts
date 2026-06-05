import { Controller, Get, Post, Patch, Body, Req, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard.js';
import { PlayersService } from './players.service.js';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return this.playersService.findMe(req.user.sub);
  }

  @Get(':username/public')
  getPublicProfile(@Param('username') username: string) {
    return this.playersService.findPublicProfile(username);
  }

  @Patch('me/account')
  @UseGuards(JwtAuthGuard)
  updateAccount(
    @Req() req: any,
    @Body() body: { username?: string; password?: string },
  ) {
    return this.playersService.updateAccount(req.user.sub, body.username, body.password);
  }

  @Patch('me/badge')
  @UseGuards(JwtAuthGuard)
  equipBadge(@Req() req: any, @Body() body: { badgeName: string | null }) {
    return this.playersService.equipBadge(req.user.sub, body.badgeName);
  }

  @Patch('me/costume')
  @UseGuards(JwtAuthGuard)
  updateCostume(@Req() req: any, @Body() body: { costume: string }) {
    return this.playersService.updateCostume(req.user.sub, body.costume);
  }

  @Post('me/costume/buy')
  @UseGuards(JwtAuthGuard)
  buyCostume(@Req() req: any, @Body() body: { costume: string }) {
    return this.playersService.buyCostume(req.user.sub, body.costume);
  }

  @Post('me/scene')
  @UseGuards(JwtAuthGuard)
  completeScene(
    @Req() req: any,
    @Body() body: {
      sceneKey: string;
      xp: number;
      gold: number;
      chapterSlug?: string;
      chapterXp?: number;
      chapterGold?: number;
      badgeKey?: string;
    },
  ) {
    return this.playersService.completeScene(
      req.user.sub,
      body.sceneKey,
      body.xp   ?? 0,
      body.gold  ?? 0,
      body.chapterSlug,
      body.chapterXp,
      body.chapterGold,
      body.badgeKey,
    );
  }
}
