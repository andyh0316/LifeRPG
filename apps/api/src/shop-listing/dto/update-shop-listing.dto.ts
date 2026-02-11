import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateShopListingDto {
  @ApiProperty({ type: Number })
  @IsInt()
  itemId!: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(0)
  coinCost!: number;

  @ApiProperty({ type: Number })
  @IsInt()
  sortOrder!: number;
}
