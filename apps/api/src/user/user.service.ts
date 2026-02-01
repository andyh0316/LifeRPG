import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '@life-rpg/database';
import type { createDb } from '@life-rpg/database';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

const userSelect = {
  id: users.id,
  email: users.email,
  firstName: users.firstName,
  lastName: users.lastName,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

type UserRow = {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toUserResponse(row: UserRow): UserResponseDto {
  return {
    id: row.id,
    email: row.email,
    fullName: [row.firstName, row.lastName].filter(Boolean).join(' '),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class UserService {
  constructor(@Inject('DATABASE') private db: ReturnType<typeof createDb>) {}

  async findAll(): Promise<UserResponseDto[]> {
    const results = await this.db.select(userSelect).from(users);
    return results.map(toUserResponse);
  }

  async findOne(id: string): Promise<UserResponseDto | null> {
    const results = await this.db
      .select(userSelect)
      .from(users)
      .where(eq(users.id, id));
    return results[0] ? toUserResponse(results[0]) : null;
  }

  async create(data: CreateUserDto): Promise<UserResponseDto> {
    const results = await this.db
      .insert(users)
      .values(data)
      .returning(userSelect);
    return toUserResponse(results[0]);
  }

  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
    const results = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning(userSelect);
    return results[0] ? toUserResponse(results[0]) : null;
  }

  async remove(id: string): Promise<UserResponseDto | null> {
    const results = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning(userSelect);
    return results[0] ? toUserResponse(results[0]) : null;
  }
}
