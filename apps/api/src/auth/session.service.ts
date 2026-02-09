import { createHash, randomBytes } from 'node:crypto';
import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { and, asc, eq, ilike, isNull } from 'drizzle-orm';
import { userSessions, users, userCharacter } from '@life-rpg/database';
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

    const [session] = await this.db
      .select({
        userId: userSessions.userId,
        expiresAt: userSessions.expiresAt,
        email: users.email,
        selectedCharacterId: userSessions.selectedCharacterId,
      })
      .from(userSessions)
      .innerJoin(users, eq(userSessions.userId, users.id))
      .where(
        and(eq(userSessions.token, hashed), isNull(userSessions.revokedAt)),
      );

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException();
    }

    let userCharacterId: number;

    if (session.selectedCharacterId) {
      const [char] = await this.db
        .select({ id: userCharacter.id })
        .from(userCharacter)
        .where(
          and(
            eq(userCharacter.id, session.selectedCharacterId),
            eq(userCharacter.userId, session.userId),
          ),
        );
      userCharacterId =
        char?.id ?? (await this.getFirstCharacterId(session.userId));
    } else {
      userCharacterId = await this.getFirstCharacterId(session.userId);
    }

    return {
      id: session.userId,
      email: session.email,
      userCharacterId,
    };
  }

  async selectCharacter(
    rawToken: string,
    characterId: number,
    userId: number,
  ): Promise<void> {
    const [char] = await this.db
      .select({ id: userCharacter.id })
      .from(userCharacter)
      .where(
        and(
          eq(userCharacter.id, characterId),
          eq(userCharacter.userId, userId),
        ),
      );

    if (!char) {
      throw new ForbiddenException('Character does not belong to this user');
    }

    const hashed = hashToken(rawToken);
    await this.db
      .update(userSessions)
      .set({ selectedCharacterId: characterId })
      .where(eq(userSessions.token, hashed));
  }

  async getUserCharacters(
    userId: number,
  ): Promise<
    { id: number; name: string; level: number; xp: number; coins: number }[]
  > {
    return this.db
      .select({
        id: userCharacter.id,
        name: userCharacter.name,
        level: userCharacter.level,
        xp: userCharacter.xp,
        coins: userCharacter.coins,
      })
      .from(userCharacter)
      .where(eq(userCharacter.userId, userId))
      .orderBy(asc(userCharacter.id));
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

  private async getFirstCharacterId(userId: number): Promise<number> {
    const [first] = await this.db
      .select({ id: userCharacter.id })
      .from(userCharacter)
      .where(eq(userCharacter.userId, userId))
      .orderBy(asc(userCharacter.id))
      .limit(1);

    if (!first) {
      throw new UnauthorizedException('User has no characters');
    }

    return first.id;
  }
}
