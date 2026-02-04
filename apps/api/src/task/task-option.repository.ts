import { Inject, Injectable } from '@nestjs/common';
import { taskOptions } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

export type TaskOptionRow = typeof taskOptions.$inferSelect;
export type TaskOptionInsert = typeof taskOptions.$inferInsert;

@Injectable()
export class TaskOptionRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async create(data: TaskOptionInsert, tx?: Db): Promise<TaskOptionRow> {
    const [row] = await (tx ?? this.db)
      .insert(taskOptions)
      .values(data)
      .returning();
    return row;
  }
}
