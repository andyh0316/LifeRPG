import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskBlockResponseDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  amount!: number | null;

  @ApiProperty()
  xpReward!: number;

  @ApiProperty()
  coinReward!: number;
}
