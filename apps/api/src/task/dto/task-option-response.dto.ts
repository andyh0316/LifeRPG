import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskOptionResponseDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiPropertyOptional({ type: Number, nullable: true })
  goal!: number | null;

  @ApiProperty()
  xpReward!: number;

  @ApiProperty()
  coinReward!: number;
}
