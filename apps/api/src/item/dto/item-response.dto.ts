import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ItemResponseDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: Number })
  userCharacterId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  desc!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  icon!: string | null;

  @ApiProperty({ type: Number })
  amount!: number;

  @ApiProperty({ enum: ['count', 'minutes'] })
  amountUnit!: string;
}
