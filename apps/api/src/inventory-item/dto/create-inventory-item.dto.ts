import { IsInt, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ type: Number })
  @IsInt()
  itemId!: number;

  @ApiPropertyOptional({ enum: ['shop', 'drop', 'achievement', 'gift'] })
  @IsOptional()
  @IsIn(['shop', 'drop', 'achievement', 'gift'])
  source?: 'shop' | 'drop' | 'achievement' | 'gift';
}
