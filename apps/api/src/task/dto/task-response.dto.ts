import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description!: string | null;

  @ApiProperty()
  xpReward!: number;

  @ApiProperty()
  coinReward!: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  icon!: string | null;
}
