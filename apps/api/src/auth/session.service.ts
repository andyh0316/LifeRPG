import { createHash, randomBytes } from 'node:crypto';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { and, eq, ilike, isNull } from 'drizzle-orm';
import { userSessions, users } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import type { AuthUser } from './current-user.decorator';

const SESSION_EXPIRY_DAYS = Number(process.env.SESSION_EXPIRY_DAYS) || 30;

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class SessionService {
  constructor(@Inject('DATABASE') private db: Db) {}

  async createSession(user: {
    id: number;
  }): Promise<{ raw: string; expiresAt: Date }> {
    const raw = randomBytes(32).toString('hex');
    const hashed = hashToken(raw);
    const expiresAt = new Date(
      Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.db.insert(userSessions).values({
      userId: user.id,
      token: hashed,
      expiresAt,
    });

    return { raw, expiresAt };
  }

  async validateSession(rawToken: string): Promise<AuthUser> {
    const hashed = hashToken(rawToken);

    const [row] = await this.db
      .select({
        userId: userSessions.userId,
        expiresAt: userSessions.expiresAt,
        email: users.email,
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(eq(userSessions.token, hashed), isNull(userSessions.revokedAt)),
      );

    if (!row || row.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    return { id: row.userId, email: row.email };
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

  async revokeSession(rawToken: string): Promise<void> {
    const hashed = hashToken(rawToken);
    await this.db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(eq(userSessions.token, hashed));
  }

  async revokeAllUserSessions(userId: number): Promise<void> {
    await this.db
      .update(userSessions)
      .set({ revokedAt: new Date() })
      .where(
        and(eq(userSessions.userId, userId), isNull(userSessions.revokedAt)),
      );
  }
}
