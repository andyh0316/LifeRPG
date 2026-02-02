import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDetailDto } from './dto/user-detail.dto';
import { UserProfileDto } from './dto/user-profile.dto';

const userSelect = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

// Includes game-related stats on top of the base fields.
const userProfileSelect = {
  ...userSelect,
  level: users.level,
  xp: users.xp,
  coins: users.coins,
};

type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

type UserProfileRow = UserRow & {
  level: number;
  xp: number;
  coins: number;
};

/** Maps a database row to a UserDetailDto. */
function toUserDetail(row: UserRow): UserDetailDto {
  return {
    id: row.id,
    email: row.email,
    fullName: [row.firstName, row.lastName].filter(Boolean).join(' '),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Maps a database row to a UserProfileDto with game stats. */
function toUserProfile(row: UserProfileRow): UserProfileDto {
  return {
    ...toUserDetail(row),
    level: row.level,
    xp: row.xp,
    coins: row.coins,
  };
}

@Injectable()
export class UserService {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findAll(): Promise<UserDetailDto[]> {
    const results = await this.db.select(userSelect).from(users);
    return results.map(toUserDetail);
  }

  async findOne(id: string): Promise<UserProfileDto | null> {
    const results = await this.db
      .select(userProfileSelect)
      .from(users)
      .where(eq(users.id, id));
    return results[0] ? toUserProfile(results[0]) : null;
  }

  async create(data: CreateUserDto): Promise<UserDetailDto> {
    const results = await this.db
      .insert(users)
      .values(data)
      .returning(userSelect);
    return toUserDetail(results[0]);
  }

  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<UserDetailDto | null> {
    const results = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning(userSelect);
    return results[0] ? toUserDetail(results[0]) : null;
  }

  async remove(id: string): Promise<UserDetailDto | null> {
    const results = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning(userSelect);
    return results[0] ? toUserDetail(results[0]) : null;
  }
}
