import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskOptionResponseDto } from './task-option-response.dto';

export class TaskResponseDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: Number })
  userId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  desc!: string | null;

  @ApiProperty()
  xpReward!: number;

  @ApiProperty()
  coinReward!: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  icon!: string | null;

  @ApiPropertyOptional({ enum: ['minutes'], nullable: true })
  goalUnit!: string | null;

  @ApiProperty({ type: [TaskOptionResponseDto] })
  options!: TaskOptionResponseDto[];
}
