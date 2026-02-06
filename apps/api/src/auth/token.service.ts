import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { and, eq, ilike, isNull } from 'drizzle-orm';
import { refreshTokens, users } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

const REFRESH_TOKEN_EXPIRY_DAYS = 30;

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class TokenService {
  constructor(
    @Inject('DATABASE') private db: Db,
    private readonly jwtService: JwtService,
  ) {}

  generateAccessToken(user: { id: number; email: string }): string {
    return this.jwtService.sign({ sub: user.id, email: user.email });
  }

  async generateRefreshToken(user: { id: number }): Promise<string> {
    const raw = randomBytes(32).toString('hex');
    const hashed = hashToken(raw);
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.db.insert(refreshTokens).values({
      userId: user.id,
      token: hashed,
      expiresAt,
    });

    return raw;
  }

  async refreshAccessToken(
    rawRefreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const hashed = hashToken(rawRefreshToken);

    const [row] = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(eq(refreshTokens.token, hashed), isNull(refreshTokens.revokedAt)),
      );

    if (!row || row.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    // Look up user email for the access token payload
    const [user] = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.id, row.userId));

    if (!user) {
      throw new UnauthorizedException();
    }

    // Rotate: revoke old, issue new
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.id, row.id));

    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async findUserByEmail(
    email: string,
  ): Promise<{ id: number; email: string } | undefined> {
    const [user] = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(ilike(users.email, email));
    return user;
  }

  async revokeRefreshToken(rawRefreshToken: string): Promise<void> {
    const hashed = hashToken(rawRefreshToken);
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(eq(refreshTokens.token, hashed));
  }

  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
      );
  }
}
