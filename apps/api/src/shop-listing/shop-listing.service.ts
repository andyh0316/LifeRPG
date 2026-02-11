import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ShopListingRepository,
  ShopListingRow,
} from './shop-listing.repository';
import { ShopListingResponseDto } from './dto/shop-listing-response.dto';
import { CreateShopListingDto } from './dto/create-shop-listing.dto';
import { UpdateShopListingDto } from './dto/update-shop-listing.dto';

@Injectable()
export class ShopListingService {
  constructor(private readonly shopListingRepository: ShopListingRepository) {}

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
}
