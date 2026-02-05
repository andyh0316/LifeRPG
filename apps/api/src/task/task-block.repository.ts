import { Inject, Injectable } from '@nestjs/common';
import { eq, and, notInArray, inArray } from 'drizzle-orm';
import { taskBlocks } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

export type TaskBlockRow = typeof taskBlocks.$inferSelect;
export type TaskBlockInsert = typeof taskBlocks.$inferInsert;

@Injectable()
export class TaskBlockRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findByTaskId(taskId: number, tx?: Db): Promise<TaskBlockRow[]> {
    return (tx ?? this.db)
      .select()
      .from(taskBlocks)
      .where(eq(taskBlocks.taskId, taskId));
  }

  async create(data: TaskBlockInsert, tx?: Db): Promise<TaskBlockRow> {
    const [row] = await (tx ?? this.db)
      .insert(taskBlocks)
      .values(data)
      .returning();
    return row;
  }

  async createMany(data: TaskBlockInsert[], tx?: Db): Promise<TaskBlockRow[]> {
    return (tx ?? this.db).insert(taskBlocks).values(data).returning();
  }

  async update(
    id: number,
    data: Partial<TaskBlockInsert>,
    tx?: Db,
  ): Promise<TaskBlockRow> {
    const [row] = await (tx ?? this.db)
      .update(taskBlocks)
      .set(data)
      .where(eq(taskBlocks.id, id))
      .returning();
    return row;
  }

  async deleteByTaskId(taskId: number, tx?: Db): Promise<void> {
    await (tx ?? this.db)
      .delete(taskBlocks)
      .where(eq(taskBlocks.taskId, taskId));
  }

  async deleteByIds(ids: number[], tx?: Db): Promise<void> {
    if (!ids.length) return;
    await (tx ?? this.db).delete(taskBlocks).where(inArray(taskBlocks.id, ids));
  }

  async deleteByTaskIdExcept(
    taskId: number,
    keepIds: number[],
    tx?: Db,
  ): Promise<void> {
    await (tx ?? this.db)
      .delete(taskBlocks)
      .where(
        keepIds.length
          ? and(
              eq(taskBlocks.taskId, taskId),
              notInArray(taskBlocks.id, keepIds),
            )
          : eq(taskBlocks.taskId, taskId),
      );
  }
}
