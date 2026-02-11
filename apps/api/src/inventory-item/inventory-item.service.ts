import { Injectable, NotFoundException } from '@nestjs/common';
import {
  InventoryItemRepository,
  InventoryItemRow,
} from './inventory-item.repository';
import { InventoryItemResponseDto } from './dto/inventory-item-response.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryItemService {
  constructor(
    private readonly inventoryItemRepository: InventoryItemRepository,
  ) {}

  private toDto(row: InventoryItemRow): InventoryItemResponseDto {
    return {
      id: row.id,
      userCharacterId: row.userCharacterId,
      itemId: row.itemId,
      source: row.source,
      acquiredAt: row.acquiredAt.toISOString(),
      usedAt: row.usedAt?.toISOString() ?? null,
    };
  }

  async findAll(userCharacterId: number): Promise<InventoryItemResponseDto[]> {
    const rows = await this.inventoryItemRepository.findAll({
      userCharacterId,
    });
    return rows.map((row) => this.toDto(row));
  }

  async findOne(id: number): Promise<InventoryItemResponseDto> {
    const row = await this.inventoryItemRepository.findById(id);
    if (!row) {
      throw new NotFoundException(`Inventory item ${id} not found`);
    }
    return this.toDto(row);
  }

  async create(
    dto: CreateInventoryItemDto,
    userCharacterId: number,
  ): Promise<InventoryItemResponseDto> {
    const row = await this.inventoryItemRepository.create({
      userCharacterId,
      itemId: dto.itemId,
      source: dto.source,
    });
    return this.toDto(row);
  }

  async update(
    id: number,
    dto: UpdateInventoryItemDto,
  ): Promise<InventoryItemResponseDto> {
    const row = await this.inventoryItemRepository.update(id, {
      itemId: dto.itemId,
      source: dto.source,
      usedAt: dto.usedAt ? new Date(dto.usedAt) : null,
    });
    if (!row) {
      throw new NotFoundException(`Inventory item ${id} not found`);
    }
    return this.toDto(row);
  }

  async remove(id: number): Promise<InventoryItemResponseDto> {
    const row = await this.inventoryItemRepository.softDelete(id);
    if (!row) {
      throw new NotFoundException(`Inventory item ${id} not found`);
    }
    return this.toDto(row);
  }
}
