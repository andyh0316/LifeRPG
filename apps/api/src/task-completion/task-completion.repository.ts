import { Inject, Injectable } from '@nestjs/common';
import { sql, inArray, and, eq } from 'drizzle-orm';
import { taskCompletions, tasks } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

@Injectable()
export class TaskCompletionRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async sumAmountsByTaskIds(taskIds: number[]): Promise<Map<number, number>> {
    if (taskIds.length === 0) return new Map();

    const rows = await this.db
      .select({
        taskId: taskCompletions.taskId,
        total: sql<number>`coalesce(sum(${taskCompletions.amount}), 0)`,
      })
      .from(taskCompletions)
      .innerJoin(tasks, eq(tasks.id, taskCompletions.taskId))
      .where(
        and(
          inArray(taskCompletions.taskId, taskIds),
          sql`${taskCompletions.completedAt} >= CASE ${tasks.goalPeriod}
            WHEN 'day-long' THEN date_trunc('day', NOW() AT TIME ZONE 'UTC')
            WHEN 'week-long' THEN date_trunc('week', NOW() AT TIME ZONE 'UTC')
            WHEN 'month-long' THEN date_trunc('month', NOW() AT TIME ZONE 'UTC')
          END`,
        ),
      )
      .groupBy(taskCompletions.taskId);

    const map = new Map<number, number>();
    for (const row of rows) {
      map.set(row.taskId, Number(row.total));
    }
    return map;
  }
}
