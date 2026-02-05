import { Inject, Injectable } from '@nestjs/common';
import { eq, and, notInArray, inArray } from 'drizzle-orm';
import { taskOptions } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

export type TaskOptionRow = typeof taskOptions.$inferSelect;
export type TaskOptionInsert = typeof taskOptions.$inferInsert;

@Injectable()
export class TaskOptionRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findByTaskId(taskId: number, tx?: Db): Promise<TaskOptionRow[]> {
    return (tx ?? this.db)
      .select()
      .from(taskOptions)
      .where(eq(taskOptions.taskId, taskId));
  }

  async create(data: TaskOptionInsert, tx?: Db): Promise<TaskOptionRow> {
    const [row] = await (tx ?? this.db)
      .insert(taskOptions)
      .values(data)
      .returning();
    return row;
  }

  async createMany(
    data: TaskOptionInsert[],
    tx?: Db,
  ): Promise<TaskOptionRow[]> {
    return (tx ?? this.db).insert(taskOptions).values(data).returning();
  }

  async update(
    id: number,
    data: Partial<TaskOptionInsert>,
    tx?: Db,
  ): Promise<TaskOptionRow> {
    const [row] = await (tx ?? this.db)
      .update(taskOptions)
      .set(data)
      .where(eq(taskOptions.id, id))
      .returning();
    return row;
  }

  async deleteByTaskId(taskId: number, tx?: Db): Promise<void> {
    await (tx ?? this.db)
      .delete(taskOptions)
      .where(eq(taskOptions.taskId, taskId));
  }

  async deleteByIds(ids: number[], tx?: Db): Promise<void> {
    if (!ids.length) return;
    await (tx ?? this.db)
      .delete(taskOptions)
      .where(inArray(taskOptions.id, ids));
  }

  async deleteByTaskIdExcept(
    taskId: number,
    keepIds: number[],
    tx?: Db,
  ): Promise<void> {
    await (tx ?? this.db)
      .delete(taskOptions)
      .where(
        keepIds.length
          ? and(
              eq(taskOptions.taskId, taskId),
              notInArray(taskOptions.id, keepIds),
            )
          : eq(taskOptions.taskId, taskId),
      );
  }
}
