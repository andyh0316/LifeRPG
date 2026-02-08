import { ApiProperty } from '@nestjs/swagger';

export class GoalsResponseDto {
  @ApiProperty()
  id!: number;

  @ApiProperty({ type: Number })
  userId!: number;

  @ApiProperty({ type: Number, nullable: true })
  dailyXpTarget!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  weeklyXpTarget!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  monthlyXpTarget!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  quarterlyXpTarget!: number | null;

  @ApiProperty({ type: Number, nullable: true })
  yearlyXpTarget!: number | null;
}
