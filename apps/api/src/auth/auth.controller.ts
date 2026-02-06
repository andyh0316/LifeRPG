import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { TokenService } from './token.service';
import { clearTokenCookies, setTokenCookies } from './cookie.helper';
import { Public } from './public.decorator';
import { CurrentUser, type AuthUser } from './current-user.decorator';
import { AuthUserDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly tokenService: TokenService) {}

  // TODO: missing password
  @Public()
  @Post('login')
  @ApiOkResponse({ type: LoginResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.tokenService.findUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const { raw: refreshToken, expiresAt: refreshTokenExpiresAt } =
      await this.tokenService.generateRefreshToken(user);
    setTokenCookies(res, accessToken, refreshToken);

    return {
      accessTokenExpiresAt: this.tokenService.getAccessTokenExpiry(accessToken),
      refreshTokenExpiresAt,
    };
  }

  @Public()
  @Post('refresh')
  @ApiOkResponse({ description: 'Tokens refreshed' })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawRefreshToken = req.cookies?.['refresh_token'];
    if (!rawRefreshToken) {
      throw new UnauthorizedException();
    }

    const { accessToken, refreshToken } =
      await this.tokenService.refreshAccessToken(rawRefreshToken);

    setTokenCookies(res, accessToken, refreshToken);
  }

  @Public()
  @Post('logout')
  @ApiOkResponse({ description: 'Logged out' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rawRefreshToken = req.cookies?.['refresh_token'];
    if (rawRefreshToken) {
      await this.tokenService.revokeRefreshToken(rawRefreshToken);
    }
    clearTokenCookies(res);
  }

  @Get('me')
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  me(@CurrentUser() user: AuthUser): AuthUserDto {
    return { id: user.id, email: user.email };
  }
}
