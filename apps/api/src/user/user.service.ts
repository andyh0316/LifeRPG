import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { users } from '@life-rpg/database';
import type { createDb } from '@life-rpg/database';

@Injectable()
export class UserService {
  constructor(@Inject('DATABASE') private db: ReturnType<typeof createDb>) {}

  findAll() {
    return this.db.select().from(users);
  }

  async findOne(id: string) {
    const results = await this.db.select().from(users).where(eq(users.id, id));
    return results[0] ?? null;
  }

  async create(data: { email: string; firstName: string; lastName?: string; displayName: string }) {
    const results = await this.db.insert(users).values(data).returning();
    return results[0];
  }

  async update(id: string, data: { email?: string; firstName?: string; lastName?: string; displayName?: string }) {
    const results = await this.db.update(users).set(data).where(eq(users.id, id)).returning();
    return results[0] ?? null;
  }

  async remove(id: string) {
    const results = await this.db.delete(users).where(eq(users.id, id)).returning();
    return results[0] ?? null;
  }
}
