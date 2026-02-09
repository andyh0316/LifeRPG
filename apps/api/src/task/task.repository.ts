import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { taskBlocks, tasks } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

export type TaskRow = typeof tasks.$inferSelect;
export type TaskInsert = typeof tasks.$inferInsert;

@Injectable()
export class TaskRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findAll(options?: {
    userCharacterId?: number;
    includeBlocks?: boolean;
    includeCompletions?: boolean;
  }) {
    const conditions = [isNull(tasks.deletedAt)];
    if (options?.userCharacterId != null) {
      conditions.push(eq(tasks.userCharacterId, options.userCharacterId));
    }

    const rows = await this.db.query.tasks.findMany({
      where: and(...conditions),
      orderBy: [asc(tasks.sortOrder), asc(tasks.id)],
      with: {
        ...(options?.includeBlocks && {
          blocks: { orderBy: asc(taskBlocks.sortOrder) },
        }),
        ...(options?.includeCompletions && { completions: true }),
      },
    });

    return rows;
  }

  async findById(id: number): Promise<TaskRow | undefined> {
    const [row] = await this.db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)));
    return row;
  }

  async getNextSortOrder(userCharacterId: number, tx?: Db): Promise<number> {
    const [row] = await (tx ?? this.db)
      .select({ value: sql<number>`coalesce(max(${tasks.sortOrder}), -1) + 1` })
      .from(tasks)
      .where(
        and(
          eq(tasks.userCharacterId, userCharacterId),
          isNull(tasks.deletedAt),
        ),
      );
    return row.value;
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

  async updateSortOrders(updates: { id: number; sortOrder: number }[]) {
    await this.db.transaction(async (tx) => {
      await Promise.all(
        updates.map((u) =>
          tx
            .update(tasks)
            .set({ sortOrder: u.sortOrder })
            .where(eq(tasks.id, u.id)),
        ),
      );
    });
  }

  async softDelete(id: number): Promise<TaskRow | undefined> {
    const [row] = await this.db
      .update(tasks)
      .set({ deletedAt: new Date() })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .returning();
    return row;
  }
}
