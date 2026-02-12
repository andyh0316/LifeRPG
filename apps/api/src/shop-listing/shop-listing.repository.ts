import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { shopListings } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';

export type ShopListingRow = typeof shopListings.$inferSelect;
export type ShopListingInsert = typeof shopListings.$inferInsert;

@Injectable()
export class ShopListingRepository {
  constructor(@Inject('DATABASE') private db: Db) {}

  async findAll(options?: { userCharacterId?: number }) {
    const conditions = [isNull(shopListings.deletedAt)];
    if (options?.userCharacterId != null) {
      conditions.push(
        eq(shopListings.userCharacterId, options.userCharacterId),
      );
    }

    return this.db.query.shopListings.findMany({
      where: and(...conditions),
      orderBy: [asc(shopListings.sortOrder), asc(shopListings.id)],
    });
  }

  async findById(id: number): Promise<ShopListingRow | undefined> {
    const [row] = await this.db
      .select()
      .from(shopListings)
      .where(and(eq(shopListings.id, id), isNull(shopListings.deletedAt)));
    return row;
  }

  async create(data: ShopListingInsert, tx?: Db): Promise<ShopListingRow> {
    const [row] = await (tx ?? this.db)
      .insert(shopListings)
      .values(data)
      .returning();
    return row;
  }

  async update(
    id: number,
    data: Partial<ShopListingInsert>,
    tx?: Db,
  ): Promise<ShopListingRow | undefined> {
    const [row] = await (tx ?? this.db)
      .update(shopListings)
      .set(data)
      .where(eq(shopListings.id, id))
      .returning();
    return row;
  }

  async softDelete(id: number): Promise<ShopListingRow | undefined> {
    const [row] = await this.db
      .update(shopListings)
      .set({ deletedAt: new Date() })
      .where(and(eq(shopListings.id, id), isNull(shopListings.deletedAt)))
      .returning();
    return row;
  }
}
