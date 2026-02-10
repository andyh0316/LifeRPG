import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WeeklyTrackerTaskDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  icon!: string | null;

  @ApiProperty({ enum: ['count', 'minutes'] })
  amountUnit!: string;

  @ApiProperty({ type: Number })
  sortOrder!: number;

  @ApiProperty({ type: [Number], description: 'Mon–Sun totals (7 elements)' })
  dailyTotals!: number[];
}
