import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  private users: User[] = [];
  private idCounter = 1;

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }

  create(data: Omit<User, 'id'>): User {
    const user: User = { id: this.idCounter++, ...data };
    this.users.push(user);
    return user;
  }

  update(id: number, data: Partial<Omit<User, 'id'>>): User | undefined {
    const user = this.findOne(id);
    if (!user) return undefined;
    Object.assign(user, data);
    return user;
  }

  remove(id: number): boolean {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }
}
