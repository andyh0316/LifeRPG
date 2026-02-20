import { INestApplication } from '@nestjs/common';
import type { Db } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../../test/setup-integration';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponseDto } from './dto/item-response.dto';

describe('Item Integration', () => {
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

  it('POST /items - creates an item and returns it with defaults', async () => {
    // #region ----- SETUP -----
    const input: CreateItemDto = {
      name: 'Gaming session',
      desc: 'Play video games guilt-free',
      icon: 'gamepad',
      amount: 60,
      amountUnit: 'minutes',
    };
    // #endregion

    // #region ----- ACT -----
    const res = await request.post('/items').send(input).expect(201);
    // #endregion

    // #region ----- ASSERT -----
    const item: ItemResponseDto = res.body;
    expect(item.id).toBeDefined();
    expect(item.name).toBe('Gaming session');
    expect(item.desc).toBe('Play video games guilt-free');
    expect(item.icon).toBe('gamepad');
    expect(item.amount).toBe(60);
    expect(item.amountUnit).toBe('minutes');
    // #endregion
  });

  it('GET /items - returns all items for current character', async () => {
    // #region ----- SETUP -----
    await request.post('/items').send({ name: 'Item A' }).expect(201);
    await request.post('/items').send({ name: 'Item B' }).expect(201);
    // #endregion

    // #region ----- ACT -----
    const res = await request.get('/items').expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const items: ItemResponseDto[] = res.body;
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe('Item A');
    expect(items[1].name).toBe('Item B');
    // #endregion
  });

  it('PUT /items/:id - updates all fields', async () => {
    // #region ----- SETUP -----
    const createRes = await request
      .post('/items')
      .send({ name: 'Old name' })
      .expect(201);
    const created: ItemResponseDto = createRes.body;

    const updateInput: UpdateItemDto = {
      name: 'New name',
      desc: 'Updated description',
      icon: 'star',
      amount: 30,
      amountUnit: 'minutes',
    };
    // #endregion

    // #region ----- ACT -----
    const res = await request
      .put(`/items/${created.id}`)
      .send(updateInput)
      .expect(200);
    // #endregion

    // #region ----- ASSERT -----
    const item: ItemResponseDto = res.body;
    expect(item.id).toBe(created.id);
    expect(item.name).toBe('New name');
    expect(item.desc).toBe('Updated description');
    expect(item.icon).toBe('star');
    expect(item.amount).toBe(30);
    expect(item.amountUnit).toBe('minutes');
    // #endregion
  });

  it('DELETE /items/:id - soft-deletes and excludes from listing', async () => {
    // #region ----- SETUP -----
    const createRes = await request
      .post('/items')
      .send({ name: 'To delete' })
      .expect(201);
    const created: ItemResponseDto = createRes.body;
    // #endregion

    // #region ----- ACT -----
    const deleteRes = await request.delete(`/items/${created.id}`).expect(200);
    // #endregion

    // #region ----- ASSERT -----
    expect(deleteRes.body.id).toBe(created.id);
    const listRes = await request.get('/items').expect(200);
    const items: ItemResponseDto[] = listRes.body;
    expect(items.find((i) => i.id === created.id)).toBeUndefined();
    // #endregion
  });
});
