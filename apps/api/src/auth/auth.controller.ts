import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
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
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly sessionService: SessionService) {}

  // TODO: missing password
  @Public()
  @Post('login')
  @ApiOkResponse({ type: LoginResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.sessionService.findUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { raw, expiresAt } = await this.sessionService.createSession(user);
    setSessionCookie(res, raw);

    return { tokenExpiresAt: expiresAt };
  }

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
}
