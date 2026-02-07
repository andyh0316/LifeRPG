import { ApiProperty } from '@nestjs/swagger';

export class TaskBlockResponseDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: Number })
  sortOrder!: number;

  @ApiProperty({ type: Number })
  amount!: number;

  @ApiProperty()
  xpReward!: number;

  @ApiProperty()
  coinReward!: number;
}
