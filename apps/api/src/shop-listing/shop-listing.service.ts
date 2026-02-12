import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';
import { shopListings, userCharacter } from '@life-rpg/database';
import type { Db } from '@life-rpg/database';
import {
  ShopListingRepository,
  ShopListingRow,
} from './shop-listing.repository';
import { InventoryItemRepository } from '../inventory-item/inventory-item.repository';
import { UserCharacterService } from '../user-character/user-character.service';
import { ShopListingResponseDto } from './dto/shop-listing-response.dto';
import { CreateShopListingDto } from './dto/create-shop-listing.dto';
import { UpdateShopListingDto } from './dto/update-shop-listing.dto';
import { InventoryItemResponseDto } from '../inventory-item/dto/inventory-item-response.dto';

@Injectable()
export class ShopListingService {
  constructor(
    @Inject('DATABASE') private db: Db,
    private readonly shopListingRepository: ShopListingRepository,
    private readonly inventoryItemRepository: InventoryItemRepository,
    private readonly userCharacterService: UserCharacterService,
  ) {}

  private toDto(row: ShopListingRow): ShopListingResponseDto {
    return {
      id: row.id,
      userCharacterId: row.userCharacterId,
      itemId: row.itemId,
      coinCost: row.coinCost,
      sortOrder: row.sortOrder,
    };
  }

  async findAll(userCharacterId: number): Promise<ShopListingResponseDto[]> {
    const rows = await this.shopListingRepository.findAll({ userCharacterId });
    return rows.map((row) => this.toDto(row));
  }

  async findOne(id: number): Promise<ShopListingResponseDto> {
    const row = await this.shopListingRepository.findById(id);
    if (!row) {
      throw new NotFoundException(`Shop listing ${id} not found`);
    }
    return this.toDto(row);
  }

  async create(
    dto: CreateShopListingDto,
    userCharacterId: number,
  ): Promise<ShopListingResponseDto> {
    const row = await this.shopListingRepository.create({
      userCharacterId,
      itemId: dto.itemId,
      coinCost: dto.coinCost,
      sortOrder: dto.sortOrder,
    });
    return this.toDto(row);
  }

  async update(
    id: number,
    dto: UpdateShopListingDto,
  ): Promise<ShopListingResponseDto> {
    const row = await this.shopListingRepository.update(id, {
      itemId: dto.itemId,
      coinCost: dto.coinCost,
      sortOrder: dto.sortOrder,
    });
    if (!row) {
      throw new NotFoundException(`Shop listing ${id} not found`);
    }
    return this.toDto(row);
  }

  async remove(id: number): Promise<ShopListingResponseDto> {
    const row = await this.shopListingRepository.softDelete(id);
    if (!row) {
      throw new NotFoundException(`Shop listing ${id} not found`);
    }
    return this.toDto(row);
  }

  async buy(
    shopListingId: number,
    userCharacterId: number,
  ): Promise<InventoryItemResponseDto> {
    return this.db.transaction(async (tx) => {
      const [listing] = await tx
        .select()
        .from(shopListings)
        .where(
          and(
            eq(shopListings.id, shopListingId),
            isNull(shopListings.deletedAt),
          ),
        );

      if (!listing) {
        throw new NotFoundException(`Shop listing ${shopListingId} not found`);
      }

      const [char] = await tx
        .select({ coins: userCharacter.coins })
        .from(userCharacter)
        .where(eq(userCharacter.id, userCharacterId));

      if (char.coins < listing.coinCost) {
        throw new BadRequestException('Not enough coins');
      }

      const inventoryItem = await this.inventoryItemRepository.create(
        {
          userCharacterId,
          itemId: listing.itemId,
          source: 'shop',
        },
        tx,
      );

      await this.userCharacterService.addXp(
        userCharacterId,
        0,
        -listing.coinCost,
        tx,
      );

      return {
        id: inventoryItem.id,
        userCharacterId: inventoryItem.userCharacterId,
        itemId: inventoryItem.itemId,
        source: inventoryItem.source,
        acquiredAt: inventoryItem.acquiredAt.toISOString(),
        usedAt: inventoryItem.usedAt?.toISOString() ?? null,
      };
    });
  }
}
