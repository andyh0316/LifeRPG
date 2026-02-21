import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { tasks, taskCompletions } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

@Injectable()
export class TaskLogRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async getActiveTasks(userCharacterId: number) {
    return this.db
      .select({
        id: tasks.id,
        name: tasks.name,
        icon: tasks.icon,
        goalAmount: tasks.goalAmount,
        amountUnit: tasks.amountUnit,
        sortOrder: tasks.sortOrder,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.userCharacterId, userCharacterId),
          isNull(tasks.deletedAt),
        ),
      )
      .orderBy(tasks.sortOrder, tasks.id);
  }

  async getCompletionsByDay(
    taskIds: number[],
    startDate: string,
    endDate: string,
    timezone: string,
  ): Promise<Map<string, number>> {
    if (taskIds.length === 0) return new Map();

    const tz = sql`${timezone}`;
    const day = sql<string>`to_char((${taskCompletions.completedAt} AT TIME ZONE ${tz})::date, 'YYYY-MM-DD')`;

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

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(`${row.taskId}:${row.day}`, Number(row.total));
    }
    return map;
  }
}
