import { ApiProperty } from '@nestjs/swagger';

export class TaskCompletionResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  taskId!: number;

  @ApiProperty({ type: Number })
  userCharacterId!: number;

  @ApiProperty()
  xpEarned!: number;

  @ApiProperty()
  coinsEarned!: number;

  @ApiProperty()
  completedAt!: Date;
}
