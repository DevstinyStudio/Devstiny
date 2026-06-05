import { Injectable, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt.guard.js';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) throw err || new ForbiddenException('Not authenticated.');
    if (user.role !== 'ADMIN') throw new ForbiddenException('Admin access required.');
    return user;
  }
}
