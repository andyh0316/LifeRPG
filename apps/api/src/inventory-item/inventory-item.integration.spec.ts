import { INestApplication } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
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

  it('POST /inventory-items - creates and returns with defaults', async () => {
    // setup
    const item = await createItem();
    const input: CreateInventoryItemDto = {
      itemId: item.id,
      source: 'shop',
    };

    // act
    const res = await request.post('/inventory-items').send(input).expect(201);

    // assert
    const inv: InventoryItemResponseDto = res.body;
    expect(inv.id).toBeDefined();
    expect(inv.itemId).toBe(item.id);
    expect(inv.source).toBe('shop');
    expect(inv.acquiredAt).toBeDefined();
    expect(inv.usedAt).toBeNull();
  });

  it('GET /inventory-items - returns all for current character', async () => {
    // setup
    const itemA = await createItem('Item A');
    const itemB = await createItem('Item B');
    await request
      .post('/inventory-items')
      .send({ itemId: itemA.id })
      .expect(201);
    await request
      .post('/inventory-items')
      .send({ itemId: itemB.id })
      .expect(201);

    // act
    const res = await request.get('/inventory-items').expect(200);

    // assert
    const items: InventoryItemResponseDto[] = res.body;
    expect(items).toHaveLength(2);
    expect(items[0].itemId).toBe(itemA.id);
    expect(items[1].itemId).toBe(itemB.id);
  });

  it('PUT /inventory-items/:id - updates fields including usedAt', async () => {
    // setup
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

    // act
    const res = await request
      .put(`/inventory-items/${created.id}`)
      .send(updateInput)
      .expect(200);

    // assert
    const inv: InventoryItemResponseDto = res.body;
    expect(inv.id).toBe(created.id);
    expect(inv.source).toBe('gift');
    expect(inv.usedAt).toBeDefined();
  });

  it('DELETE /inventory-items/:id - soft-deletes and excludes from listing', async () => {
    // setup
    const item = await createItem();
    const createRes = await request
      .post('/inventory-items')
      .send({ itemId: item.id })
      .expect(201);
    const created: InventoryItemResponseDto = createRes.body;

    // act
    const deleteRes = await request
      .delete(`/inventory-items/${created.id}`)
      .expect(200);

    // assert
    expect(deleteRes.body.id).toBe(created.id);
    const listRes = await request.get('/inventory-items').expect(200);
    const items: InventoryItemResponseDto[] = listRes.body;
    expect(items.find((i) => i.id === created.id)).toBeUndefined();
  });
});
