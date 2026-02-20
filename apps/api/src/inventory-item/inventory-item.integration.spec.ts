import { INestApplication } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import { items, inventoryItems } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../../test/setup-integration';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';

describe('InventoryItem Integration', () => {
  let app: INestApplication;
  let db: Db;
  let request: TestAgent;
  let currentUserCharacterId: number;
  let startTransaction: () => Promise<void>;
  let rollbackTransaction: () => Promise<void>;

  beforeAll(async () => {
    ({
      app,
      db,
      request,
      currentUserCharacterId,
      startTransaction,
      rollbackTransaction,
    } = await createIntegrationApp());
  });

  beforeEach(async () => {
    await startTransaction();
  });

  afterEach(async () => {
    await rollbackTransaction();
  });

  afterAll(async () => {
    await app.close();
  });

  async function createItem(name = 'Test Item') {
    const res = await request.post('/items').send({ name }).expect(201);
    return res.body;
  }

  async function seedInventory(entries: { name: string; usedAt?: Date }[]) {
    const ids: number[] = [];
    for (const entry of entries) {
      const [item] = await db
        .insert(items)
        .values({ userCharacterId: currentUserCharacterId, name: entry.name })
        .returning();
      const [inv] = await db
        .insert(inventoryItems)
        .values({
          userCharacterId: currentUserCharacterId,
          itemId: item.id,
          source: 'shop',
          usedAt: entry.usedAt ?? null,
        })
        .returning();
      ids.push(inv.itemId);
    }
    return ids;
  }

  it('POST /inventory-items - creates and returns with defaults', async () => {
    // #region ----- SETUP -----
    const item = await createItem();
    const input: CreateInventoryItemDto = {
      itemId: item.id,
      source: 'shop',
    };
    // #endregion

    // #region ----- ACT -----
    const res = await request.post('/inventory-items').send(input).expect(201);
    // #endregion

    // #region ----- ASSERT -----
    const inv: InventoryItemResponseDto = res.body;
    expect(inv.id).toBeDefined();
    expect(inv.itemId).toBe(item.id);
    expect(inv.source).toBe('shop');
    expect(inv.acquiredAt).toBeDefined();
    expect(inv.usedAt).toBeNull();
    // #endregion
  });

  it('GET /inventory-items?usedAt=null - returns only unused items', async () => {
    // #region ----- SETUP -----
    const ids = await seedInventory([
      { name: 'Item A' },
      { name: 'Item B', usedAt: new Date() },
    ]);
    // #endregion

    // #region ----- ACT -----
    const res = await request.get('/inventory-items?usedAt=null').expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const result: InventoryItemResponseDto[] = res.body;
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe(ids[0]);
    // #endregion
  });

  it('PUT /inventory-items/:id - updates fields including usedAt', async () => {
    // #region ----- SETUP -----
    const item = await createItem();
    const createRes = await request
      .post('/inventory-items')
      .send({ itemId: item.id })
      .expect(201);
    const created: InventoryItemResponseDto = createRes.body;

    const usedAt = new Date().toISOString();
    const updateInput: UpdateInventoryItemDto = {
      itemId: item.id,
      source: 'gift',
      usedAt,
    };
    // #endregion

    // #region ----- ACT -----
    const res = await request
      .put(`/inventory-items/${created.id}`)
      .send(updateInput)
      .expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const inv: InventoryItemResponseDto = res.body;
    expect(inv.id).toBe(created.id);
    expect(inv.source).toBe('gift');
    expect(inv.usedAt).toBeDefined();
    // #endregion
  });

  it('DELETE /inventory-items/:id - soft-deletes and excludes from listing', async () => {
    // #region ----- SETUP -----
    const item = await createItem();
    const createRes = await request
      .post('/inventory-items')
      .send({ itemId: item.id })
      .expect(201);
    const created: InventoryItemResponseDto = createRes.body;
    // #endregion

    // #region ----- ACT -----
    const deleteRes = await request
      .delete(`/inventory-items/${created.id}`)
      .expect(200);
    // #endregion

    // #region ----- ASSERT -----
    expect(deleteRes.body.id).toBe(created.id);
    const listRes = await request.get('/inventory-items').expect(200);
    const items: InventoryItemResponseDto[] = listRes.body;
    expect(items.find((i) => i.id === created.id)).toBeUndefined();
    // #endregion
  });
});
