import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}

export class TaskLogResponseDto {
  @ApiProperty({ type: [TaskLogTaskDto] })
  tasks!: TaskLogTaskDto[];

  @ApiProperty({ type: [TaskLogDayEntryDto] })
  days!: TaskLogDayEntryDto[];

  @ApiPropertyOptional({ type: String, nullable: true })
  nextCursor!: string | null;
}
