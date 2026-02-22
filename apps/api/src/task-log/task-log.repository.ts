import { Inject, Injectable } from '@nestjs/common';
import { and, inArray, isNull, sql } from 'drizzle-orm';
import { taskCompletions } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

@Injectable()
export class TaskLogRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  // Returns a Map keyed by "taskId:YYYY-MM-DD" with summed  completion amounts per day
  async getCompletionsByDay(
    taskIds: number[],
    startDate: string,
    endDate: string,
    timezone: string,
  ): Promise<Map<string, number>> {
    if (taskIds.length === 0) return new Map();

    // Extract the date portion of completedAt in the caller's timezone
    const tz = sql`${timezone}`;
    const day = sql<string>`to_char((${taskCompletions.completedAt} AT TIME ZONE ${tz})::date, 'YYYY-MM-DD')`;

    // Sum amounts grouped by task and day within the date range
    const rows = await this.db
      .select({
        taskId: taskCompletions.taskId,
        day,
        total: sql<number>`coalesce(sum(${taskCompletions.amount}), 0)`,
      })
      .from(taskCompletions)
      .where(
        and(
          inArray(taskCompletions.taskId, taskIds),
          sql`${taskCompletions.completedAt} >= (${startDate}::date)::timestamp AT TIME ZONE ${tz}`,
          sql`${taskCompletions.completedAt} < ((${endDate}::date + interval '1 day')::timestamp) AT TIME ZONE ${tz}`,
          isNull(taskCompletions.deletedAt),
        ),
      )
      .groupBy(taskCompletions.taskId, sql`2`);

    // Convert rows to a lookup map
    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(`${row.taskId}:${row.day}`, Number(row.total));
    }
    return map;
  }
}
