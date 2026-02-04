import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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

  async deleteByTaskId(taskId: number, tx?: Db): Promise<void> {
    await (tx ?? this.db)
      .delete(taskOptions)
      .where(eq(taskOptions.taskId, taskId));
  }
}
