import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type VerifyCallback } from 'passport-google-oauth20';
import { SessionService } from './session.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly sessionService: SessionService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  authorizationParams(): Record<string, string> {
    return { prompt: 'select_account' };
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: { emails?: { value: string }[] },
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      return done(new UnauthorizedException('No email from Google'), undefined);
    }

    const user = await this.sessionService.findUserByEmail(email);
    if (!user) {
      return done(
        new UnauthorizedException('No account for this email'),
        undefined,
      );
    }

    done(null, user);
  }
}
