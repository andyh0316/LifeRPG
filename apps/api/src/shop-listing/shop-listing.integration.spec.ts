import { INestApplication } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { userCharacter } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import { TestAgent, createIntegrationApp } from '../test/setup-integration';
import { CreateShopListingDto } from './dto/create-shop-listing.dto';
import { UpdateShopListingDto } from './dto/update-shop-listing.dto';
import { ShopListingResponseDto } from './dto/shop-listing-response.dto';
import { InventoryItemResponseDto } from '../inventory-item/dto/inventory-item-response.dto';

describe('ShopListing Integration', () => {
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

  async function giveCoins(amount: number) {
    await db
      .update(userCharacter)
      .set({ coins: amount })
      .where(eq(userCharacter.id, currentUserCharacterId));
  }

  it('POST /shop-listings - creates a listing and returns it', async () => {
    // setup
    const item = await createItem();
    const input: CreateShopListingDto = {
      itemId: item.id,
      coinCost: 50,
      sortOrder: 1,
    };

    // act
    const res = await request.post('/shop-listings').send(input).expect(201);

    // assert
    const listing: ShopListingResponseDto = res.body;
    expect(listing.id).toBeDefined();
    expect(listing.itemId).toBe(item.id);
    expect(listing.coinCost).toBe(50);
    expect(listing.sortOrder).toBe(1);
  });

  it('GET /shop-listings - returns all listings for current character', async () => {
    // setup
    const itemA = await createItem('Item A');
    const itemB = await createItem('Item B');
    await request
      .post('/shop-listings')
      .send({ itemId: itemA.id, coinCost: 10 })
      .expect(201);
    await request
      .post('/shop-listings')
      .send({ itemId: itemB.id, coinCost: 20 })
      .expect(201);

    // act
    const res = await request.get('/shop-listings').expect(200);

    // assert
    const listings: ShopListingResponseDto[] = res.body;
    expect(listings).toHaveLength(2);
    expect(listings[0].coinCost).toBe(10);
    expect(listings[1].coinCost).toBe(20);
  });

  it('PUT /shop-listings/:id - updates all fields', async () => {
    // setup
    const itemA = await createItem('Item A');
    const itemB = await createItem('Item B');
    const createRes = await request
      .post('/shop-listings')
      .send({ itemId: itemA.id, coinCost: 10 })
      .expect(201);
    const created: ShopListingResponseDto = createRes.body;

    const updateInput: UpdateShopListingDto = {
      itemId: itemB.id,
      coinCost: 99,
      sortOrder: 5,
    };

    // act
    const res = await request
      .put(`/shop-listings/${created.id}`)
      .send(updateInput)
      .expect(200);

    // assert
    const listing: ShopListingResponseDto = res.body;
    expect(listing.id).toBe(created.id);
    expect(listing.itemId).toBe(itemB.id);
    expect(listing.coinCost).toBe(99);
    expect(listing.sortOrder).toBe(5);
  });

  it('DELETE /shop-listings/:id - soft-deletes and excludes from listing', async () => {
    // setup
    const item = await createItem();
    const createRes = await request
      .post('/shop-listings')
      .send({ itemId: item.id, coinCost: 10 })
      .expect(201);
    const created: ShopListingResponseDto = createRes.body;

    // act
    const deleteRes = await request
      .delete(`/shop-listings/${created.id}`)
      .expect(200);

    // assert
    expect(deleteRes.body.id).toBe(created.id);
    const listRes = await request.get('/shop-listings').expect(200);
    const listings: ShopListingResponseDto[] = listRes.body;
    expect(listings.find((l) => l.id === created.id)).toBeUndefined();
  });

  it('POST /shop-listings/:id/buy - purchases item and deducts coins', async () => {
    // setup
    const item = await createItem('Sword');
    const listingRes = await request
      .post('/shop-listings')
      .send({ itemId: item.id, coinCost: 50 } as CreateShopListingDto)
      .expect(201);
    const listing: ShopListingResponseDto = listingRes.body;
    await giveCoins(100);

    // act
    const res = await request
      .post(`/shop-listings/${listing.id}/buy`)
      .expect(201);

    // assert
    const inventoryItem: InventoryItemResponseDto = res.body;
    expect(inventoryItem.itemId).toBe(item.id);
    expect(inventoryItem.source).toBe('shop');
    expect(inventoryItem.acquiredAt).toBeDefined();

    const [char] = await db
      .select({ coins: userCharacter.coins })
      .from(userCharacter)
      .where(eq(userCharacter.id, currentUserCharacterId));
    expect(char.coins).toBe(50);

    const invRes = await request.get('/inventory-items').expect(200);
    expect(invRes.body).toHaveLength(1);
    expect(invRes.body[0].source).toBe('shop');
  });

  it('POST /shop-listings/:id/buy - returns 400 when not enough coins', async () => {
    // setup
    const item = await createItem('Expensive Item');
    const listingRes = await request
      .post('/shop-listings')
      .send({ itemId: item.id, coinCost: 500 } as CreateShopListingDto)
      .expect(201);
    const listing: ShopListingResponseDto = listingRes.body;
    await giveCoins(10);

    // act + assert
    await request.post(`/shop-listings/${listing.id}/buy`).expect(400);

    const [char] = await db
      .select({ coins: userCharacter.coins })
      .from(userCharacter)
      .where(eq(userCharacter.id, currentUserCharacterId));
    expect(char.coins).toBe(10);
  });

  it('POST /shop-listings/:id/buy - returns 404 for non-existent listing', async () => {
    // act + assert
    await request.post('/shop-listings/99999/buy').expect(404);
  });
});
