import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNotNull, isNull } from 'drizzle-orm';
import { inventoryItems } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

export type InventoryItemRow = typeof inventoryItems.$inferSelect;
export type InventoryItemInsert = typeof inventoryItems.$inferInsert;

@Injectable()
export class InventoryItemRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findAll(options?: {
    userCharacterId?: number;
    usedAt?: 'null' | 'not_null';
  }) {
    const conditions = [isNull(inventoryItems.deletedAt)];
    if (options?.usedAt === 'null') {
      conditions.push(isNull(inventoryItems.usedAt));
    } else if (options?.usedAt === 'not_null') {
      conditions.push(isNotNull(inventoryItems.usedAt));
    }
    if (options?.userCharacterId != null) {
      conditions.push(
        eq(inventoryItems.userCharacterId, options.userCharacterId),
      );
    }

    return this.db.query.inventoryItems.findMany({
      where: and(...conditions),
      orderBy: [asc(inventoryItems.id)],
    });
  }

  async findById(id: number): Promise<InventoryItemRow | undefined> {
    const [row] = await this.db
      .select()
      .from(inventoryItems)
      .where(and(eq(inventoryItems.id, id), isNull(inventoryItems.deletedAt)));
    return row;
  }

  async create(data: InventoryItemInsert, tx?: Db): Promise<InventoryItemRow> {
    const [row] = await (tx ?? this.db)
      .insert(inventoryItems)
      .values(data)
      .returning();
    return row;
  }

  async update(
    id: number,
    data: Partial<InventoryItemInsert>,
    tx?: Db,
  ): Promise<InventoryItemRow | undefined> {
    const [row] = await (tx ?? this.db)
      .update(inventoryItems)
      .set(data)
      .where(eq(inventoryItems.id, id))
      .returning();
    return row;
  }

  async softDelete(id: number): Promise<InventoryItemRow | undefined> {
    const [row] = await this.db
      .update(inventoryItems)
      .set({ deletedAt: new Date() })
      .where(and(eq(inventoryItems.id, id), isNull(inventoryItems.deletedAt)))
      .returning();
    return row;
  }
}
