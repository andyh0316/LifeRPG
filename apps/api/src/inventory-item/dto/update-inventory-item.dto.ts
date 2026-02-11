import { IsInt, IsIn, ValidateIf, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateInventoryItemDto {
  @ApiProperty({ type: Number })
  @IsInt()
  itemId!: number;

  @ApiProperty({ enum: ['shop', 'drop', 'achievement', 'gift'] })
  @IsIn(['shop', 'drop', 'achievement', 'gift'])
  source!: 'shop' | 'drop' | 'achievement' | 'gift';

  @ApiProperty({ type: String, nullable: true })
  @ValidateIf((o) => o.usedAt !== null)
  @IsISO8601()
  usedAt!: string | null;
}
