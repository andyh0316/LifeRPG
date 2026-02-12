import { ApiProperty } from '@nestjs/swagger';

export class ShopListingResponseDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: Number })
  userCharacterId!: number;

  @ApiProperty({ type: Number })
  itemId!: number;

  @ApiProperty({ type: Number })
  coinCost!: number;

  @ApiProperty({ type: Number })
  sortOrder!: number;
}
