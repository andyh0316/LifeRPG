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
    forDate: string = new Date().toLocaleDateString('en-CA'),
  ): Promise<Map<number, number>> {
    if (taskIds.length === 0) return new Map();

    const tz = sql`${timezone}`;
    const ref = sql`(${forDate}::date)::timestamp AT TIME ZONE ${tz}`;
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
          sql`${taskCompletions.completedAt} >= CASE COALESCE(${tasks.goalPeriod}, 'day-long')
            WHEN 'day-long' THEN ${ref}
            WHEN 'week-long' THEN date_trunc('week', ${forDate}::date)::timestamp AT TIME ZONE ${tz}
            WHEN 'month-long' THEN date_trunc('month', ${forDate}::date)::timestamp AT TIME ZONE ${tz}
          END`,
          sql`${taskCompletions.completedAt} < CASE COALESCE(${tasks.goalPeriod}, 'day-long')
            WHEN 'day-long' THEN ${ref} + interval '1 day'
            WHEN 'week-long' THEN date_trunc('week', ${forDate}::date)::timestamp AT TIME ZONE ${tz} + interval '1 week'
            WHEN 'month-long' THEN date_trunc('month', ${forDate}::date)::timestamp AT TIME ZONE ${tz} + interval '1 month'
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

  async getDailyCompletionAmounts(
    taskIds: number[],
    timezone: string = 'UTC',
  ): Promise<Map<number, { day: string; total: number }[]>> {
    if (taskIds.length === 0) return new Map();

    const tz = sql`${timezone}`;
    const rows = await this.db
      .select({
        taskId: taskCompletions.taskId,
        day: sql<string>`to_char((${taskCompletions.completedAt} AT TIME ZONE ${tz})::date, 'YYYY-MM-DD')`,
        amount: taskCompletions.amount,
      })
      .from(taskCompletions)
      .where(inArray(taskCompletions.taskId, taskIds));

    // Sum amounts per (taskId, day)
    const sums = new Map<
      string,
      { taskId: number; day: string; total: number }
    >();
    for (const row of rows) {
      const key = `${row.taskId}:${row.day}`;
      const existing = sums.get(key);
      if (existing) {
        existing.total += Number(row.amount ?? 0);
      } else {
        sums.set(key, {
          taskId: row.taskId,
          day: row.day,
          total: Number(row.amount ?? 0),
        });
      }
    }

    const map = new Map<number, { day: string; total: number }[]>();
    for (const entry of sums.values()) {
      if (!map.has(entry.taskId)) map.set(entry.taskId, []);
      map.get(entry.taskId)!.push({ day: entry.day, total: entry.total });
    }
    return map;
  }
}
