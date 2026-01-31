import { Inject, Injectable } from '@nestjs/common';
import { users } from '@life-rpg/database';
import type { createDb } from '@life-rpg/database';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  private usersList: User[] = [];
  private idCounter = 1;

  constructor(@Inject('DATABASE') private db: ReturnType<typeof createDb>) {}

  findAll() {
    return this.db.select().from(users);
  }

  findOne(id: number): User | undefined {
    return this.usersList.find((user) => user.id === id);
  }

  create(data: Omit<User, 'id'>): User {
    const user: User = { id: this.idCounter++, ...data };
    this.usersList.push(user);
    return user;
  }

  update(id: number, data: Partial<Omit<User, 'id'>>): User | undefined {
    const user = this.findOne(id);
    if (!user) return undefined;
    Object.assign(user, data);
    return user;
  }

  remove(id: number): boolean {
    const index = this.usersList.findIndex((user) => user.id === id);
    if (index === -1) return false;
    this.usersList.splice(index, 1);
    return true;
  }
}
