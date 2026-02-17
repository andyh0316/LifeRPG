import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskBlockResponseDto } from './task-block-response.dto';

export class TaskResponseDto {
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
  sortOrder!: number;

  @ApiProperty({ enum: ['count', 'minutes'] })
  amountUnit!: string;

  @ApiPropertyOptional({ type: Number, nullable: true })
  goalAmount!: number | null;

  @ApiPropertyOptional({
    enum: ['day-long', 'week-long', 'month-long'],
    nullable: true,
  })
  goalPeriod!: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  goalCompletedAmount!: number | null;

  @ApiProperty({ type: Number })
  currentStreak!: number;

  @ApiProperty({ type: [TaskBlockResponseDto] })
  blocks!: TaskBlockResponseDto[];
}
