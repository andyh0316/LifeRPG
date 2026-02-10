import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class WeeklyTrackerQueryDto {
  @ApiProperty({ example: '2025-02-03' })
  @IsDateString()
  weekStart!: string;
}
