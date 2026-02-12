import { Injectable, NotFoundException } from '@nestjs/common';
import { ItemRepository, ItemRow } from './item.repository';
import { ItemResponseDto } from './dto/item-response.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemService {
  constructor(private readonly itemRepository: ItemRepository) {}

  private toDto(row: ItemRow): ItemResponseDto {
    return {
      id: row.id,
      userCharacterId: row.userCharacterId,
      name: row.name,
      desc: row.description,
      icon: row.icon,
      amount: row.amount,
      amountUnit: row.amountUnit,
    };
  }

  async findAll(userCharacterId: number): Promise<ItemResponseDto[]> {
    const rows = await this.itemRepository.findAll({ userCharacterId });
    return rows.map((row) => this.toDto(row));
  }

  async findOne(id: number): Promise<ItemResponseDto> {
    const row = await this.itemRepository.findById(id);
    if (!row) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return this.toDto(row);
  }

  async create(
    dto: CreateItemDto,
    userCharacterId: number,
  ): Promise<ItemResponseDto> {
    const row = await this.itemRepository.create({
      userCharacterId,
      name: dto.name,
      description: dto.desc,
      icon: dto.icon,
      amount: dto.amount,
      amountUnit: dto.amountUnit,
    });
    return this.toDto(row);
  }

  async update(id: number, dto: UpdateItemDto): Promise<ItemResponseDto> {
    const row = await this.itemRepository.update(id, {
      name: dto.name,
      description: dto.desc,
      icon: dto.icon,
      amount: dto.amount,
      amountUnit: dto.amountUnit,
    });
    if (!row) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return this.toDto(row);
  }

  async remove(id: number): Promise<ItemResponseDto> {
    const row = await this.itemRepository.softDelete(id);
    if (!row) {
      throw new NotFoundException(`Item ${id} not found`);
    }
    return this.toDto(row);
  }
}
