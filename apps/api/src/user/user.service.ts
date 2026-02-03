import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users, userCharacter } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDetailDto } from './dto/user-detail.dto';

// Columns selected for every user query.
const userSelect = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  level: userCharacter.level,
  xp: userCharacter.xp,
  coins: userCharacter.coins,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

type UserRow = {
  id: number;
  email: string;
  firstName: string;
  lastName: string | null;
  level: number;
  xp: number;
  coins: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/** Maps a database row to a UserDetailDto. */
function toUserDetail(row: UserRow): UserDetailDto {
  return {
    id: row.id,
    email: row.email,
    fullName: [row.firstName, row.lastName].filter(Boolean).join(' '),
    level: row.level,
    xp: row.xp,
    coins: row.coins,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class UserService {
  constructor(@Inject('DATABASE') private db: Db) {}

  /** Returns all users with their character data. */
  async findAll(): Promise<UserDetailDto[]> {
    const results = await this.db
      .select(userSelect)
      .from(users)
      .innerJoin(userCharacter, eq(users.id, userCharacter.userId));
    return results.map(toUserDetail);
  }

  /** Returns a single user by ID, or null if not found. */
  async findOne(id: number): Promise<UserDetailDto | null> {
    const results = await this.db
      .select(userSelect)
      .from(users)
      .innerJoin(userCharacter, eq(users.id, userCharacter.userId))
      .where(eq(users.id, id));
    return results[0] ? toUserDetail(results[0]) : null;
  }

  /** Creates a new user and their character row in a single transaction. */
  async create(data: CreateUserDto): Promise<UserDetailDto> {
    return this.db.transaction(async (tx) => {
      // Insert the user record
      const [user] = await tx.insert(users).values(data).returning();

      // Insert the 1:1 character record with default stats
      await tx.insert(userCharacter).values({ userId: user.id });

      // Return the joined result
      const results = await tx
        .select(userSelect)
        .from(users)
        .innerJoin(userCharacter, eq(users.id, userCharacter.userId))
        .where(eq(users.id, user.id));
      return toUserDetail(results[0]);
    });
  }

  /** Updates a user by ID and returns the updated record, or null if not found. */
  async update(
    id: number,
    data: UpdateUserDto,
  ): Promise<UserDetailDto | null> {
    const results = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    if (!results[0]) return null;

    // Re-fetch with character join
    return this.findOne(id);
  }

  /** Deletes a user by ID and returns the deleted record, or null if not found. */
  async remove(id: number): Promise<UserDetailDto | null> {
    // Fetch the full detail before deleting
    const detail = await this.findOne(id);
    if (!detail) return null;

    // Delete character row first (FK constraint), then user
    await this.db
      .delete(userCharacter)
      .where(eq(userCharacter.userId, id));
    await this.db.delete(users).where(eq(users.id, id));
    return detail;
  }
}
