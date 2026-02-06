import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { SessionService } from './session.service';
import { setSessionCookie, clearSessionCookie } from './cookie.helper';
import { Public } from './public.decorator';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import { AuthUserDto } from './dto/auth-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly sessionService: SessionService) {}

  @Public()
  @Post('logout')
  @ApiOkResponse({ description: 'Logged out' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawToken = req.cookies?.['session_token'];
    if (rawToken) {
      await this.sessionService.revokeSession(rawToken);
    }
    clearSessionCookie(res);
  }

  @Get('me')
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  me(@CurrentUser() user: AuthUser): AuthUserDto {
    return { id: user.id, email: user.email };
  }

  @Public()
  @Get('google-login')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    // Passport redirects to Google — this body never runs.
  }

  @Public()
  @Get('google-login/callback')
  @UseGuards(AuthGuard('google'))
  async googleLoginCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as { id: number; email: string };
    const { raw } = await this.sessionService.createSession(user);
    setSessionCookie(res, raw);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(frontendUrl);
  }
}
