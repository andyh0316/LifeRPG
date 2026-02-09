import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from './public.decorator';
import { SessionService } from './session.service';
import type { AuthUser } from './current-user.decorator';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    if (
      process.env.BYPASS_AUTH === 'true' &&
      process.env.NODE_ENV === 'development'
    ) {
      request.user = {
        id: Number(process.env.BYPASS_AUTH_USER_ID),
        email: 'bypass@dev',
        userCharacterId: Number(process.env.BYPASS_AUTH_CHARACTER_ID),
      } satisfies AuthUser;
      return true;
    }
    const rawToken = request.cookies?.['session_token'];
    if (!rawToken) throw new UnauthorizedException();

    request.user = await this.sessionService.validateSession(rawToken);
    return true;
  }
}
