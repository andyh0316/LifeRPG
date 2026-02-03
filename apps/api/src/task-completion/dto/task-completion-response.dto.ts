import { ApiProperty } from '@nestjs/swagger';

export class TaskCompletionResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  taskId!: number;

  @ApiProperty({ type: Number })
  userId!: number;

  @ApiProperty()
  xpEarned!: number;

  @ApiProperty()
  coinsEarned!: number;

  @ApiProperty()
  completedAt!: Date;
}
