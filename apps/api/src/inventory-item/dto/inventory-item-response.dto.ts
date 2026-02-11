import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryItemResponseDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: Number })
  userCharacterId!: number;

  @ApiProperty({ type: Number })
  itemId!: number;

  @ApiProperty({ enum: ['shop', 'drop', 'achievement', 'gift'] })
  source!: string;

  @ApiProperty({ type: String })
  acquiredAt!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  usedAt!: string | null;
}
