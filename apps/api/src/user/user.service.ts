import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '@life-rpg/database';
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
  level: users.level,
  xp: users.xp,
  coins: users.coins,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

type UserRow = {
  id: string;
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

  /** Returns all users. */
  async findAll(): Promise<UserDetailDto[]> {
    const results = await this.db.select(userSelect).from(users);
    return results.map(toUserDetail);
  }

  /** Returns a single user by ID, or null if not found. */
  async findOne(id: string): Promise<UserDetailDto | null> {
    const results = await this.db
      .select(userSelect)
      .from(users)
      .where(eq(users.id, id));
    return results[0] ? toUserDetail(results[0]) : null;
  }

  /** Creates a new user and returns it. */
  async create(data: CreateUserDto): Promise<UserDetailDto> {
    const results = await this.db
      .insert(users)
      .values(data)
      .returning(userSelect);
    return toUserDetail(results[0]);
  }

  /** Updates a user by ID and returns the updated record, or null if not found. */
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

  /** Deletes a user by ID and returns the deleted record, or null if not found. */
  async remove(id: string): Promise<UserDetailDto | null> {
    const results = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning(userSelect);
    return results[0] ? toUserDetail(results[0]) : null;
  }
}
