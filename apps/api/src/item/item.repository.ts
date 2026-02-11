import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { items } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

export type ItemRow = typeof items.$inferSelect;
export type ItemInsert = typeof items.$inferInsert;

@Injectable()
export class ItemRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findAll(options?: { userCharacterId?: number }) {
    const conditions = [isNull(items.deletedAt)];
    if (options?.userCharacterId != null) {
      conditions.push(eq(items.userCharacterId, options.userCharacterId));
    }

    return this.db.query.items.findMany({
      where: and(...conditions),
      orderBy: [asc(items.id)],
    });
  }

  async findById(id: number): Promise<ItemRow | undefined> {
    const [row] = await this.db
      .select()
      .from(items)
      .where(and(eq(items.id, id), isNull(items.deletedAt)));
    return row;
  }

  async create(data: ItemInsert, tx?: Db): Promise<ItemRow> {
    const [row] = await (tx ?? this.db).insert(items).values(data).returning();
    return row;
  }

  async update(
    id: number,
    data: Partial<ItemInsert>,
    tx?: Db,
  ): Promise<ItemRow | undefined> {
    const [row] = await (tx ?? this.db)
      .update(items)
      .set(data)
      .where(eq(items.id, id))
      .returning();
    return row;
  }

  async softDelete(id: number): Promise<ItemRow | undefined> {
    const [row] = await this.db
      .update(items)
      .set({ deletedAt: new Date() })
      .where(and(eq(items.id, id), isNull(items.deletedAt)))
      .returning();
    return row;
  }
}
