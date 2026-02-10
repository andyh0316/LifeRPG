import { Inject, Injectable } from '@nestjs/common';
import { sql, inArray, and, eq } from 'drizzle-orm';
import { taskCompletions, tasks } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

@Injectable()
export class TaskCompletionRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async sumAmountsByTaskIds(
    taskIds: number[],
    timezone: string = 'UTC',
    referenceTime: Date = new Date(),
  ): Promise<Map<number, number>> {
    if (taskIds.length === 0) return new Map();

    const tz = sql`${timezone}`;
    const ref = sql`${referenceTime.toISOString()}::timestamptz`;
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
            WHEN 'day-long' THEN date_trunc('day', ${ref} AT TIME ZONE ${tz}) AT TIME ZONE ${tz}
            WHEN 'week-long' THEN date_trunc('week', ${ref} AT TIME ZONE ${tz}) AT TIME ZONE ${tz}
            WHEN 'month-long' THEN date_trunc('month', ${ref} AT TIME ZONE ${tz}) AT TIME ZONE ${tz}
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
