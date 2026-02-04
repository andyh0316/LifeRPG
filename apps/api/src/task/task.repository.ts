import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { tasks } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

export type TaskRow = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;

@Injectable()
export class TaskRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findAll(): Promise<TaskRow[]> {
    return this.db.select().from(tasks);
  }

  async findById(id: number): Promise<TaskRow | undefined> {
    const [row] = await this.db.select().from(tasks).where(eq(tasks.id, id));
    return row;
  }

  async create(data: TaskInsert, tx?: Db): Promise<TaskRow> {
    const [row] = await (tx ?? this.db).insert(tasks).values(data).returning();
    return row;
  }

  async update(
    id: number,
    data: Partial<TaskInsert>,
    tx?: Db,
  ): Promise<TaskRow | undefined> {
    const [row] = await (tx ?? this.db)
      .update(tasks)
      .set(data)
      .where(eq(tasks.id, id))
      .returning();
    return row;
  }
}
