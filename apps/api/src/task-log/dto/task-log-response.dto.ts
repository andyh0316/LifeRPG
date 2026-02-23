import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalsProgressResponseDto } from '../../user-character/dto/goals-progress-response.dto';

export class TaskLogTaskDto {
  @ApiProperty({ type: Number })
  taskId!: number;

  @ApiProperty({ type: String })
  taskName!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  taskIcon!: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  goalAmount!: number | null;

  @ApiPropertyOptional({
    enum: ['day-long', 'week-long', 'month-long'],
    nullable: true,
  })
  goalPeriod!: string | null;

  @ApiProperty({ enum: ['count', 'minutes'] })
  amountUnit!: string;
}

export class TaskLogDayEntryDto {
  @ApiProperty({ type: String })
  date!: string;

  @ApiProperty({ type: [Number] })
  completions!: number[];

  @ApiProperty({ type: Number })
  totalXp!: number;
}

export class TaskLogResponseDto {
  @ApiProperty({ type: [TaskLogTaskDto] })
  tasks!: TaskLogTaskDto[];

  @ApiProperty({ type: GoalsProgressResponseDto })
  goalsProgress!: GoalsProgressResponseDto;

  @ApiProperty({ type: [TaskLogDayEntryDto] })
  days!: TaskLogDayEntryDto[];

  @ApiPropertyOptional({ type: String, nullable: true })
  nextCursor!: string | null;
}
