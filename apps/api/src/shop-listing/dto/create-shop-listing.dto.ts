import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShopListingDto {
  @ApiProperty({ type: Number })
  @IsInt()
  itemId!: number;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(0)
  coinCost!: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}
