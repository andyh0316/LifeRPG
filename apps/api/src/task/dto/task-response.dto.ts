import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description!: string | null;

  @ApiProperty()
  xpReward!: number;

  @ApiProperty()
  coinReward!: number;

  @ApiPropertyOptional()
  icon!: string | null;
}
