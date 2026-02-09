import { ApiProperty } from '@nestjs/swagger';

export class PeriodProgressDto {
  @ApiProperty({ type: Number, nullable: true })
  target!: number | null;

  @ApiProperty()
  current!: number;
}

export class GoalsProgressResponseDto {
  @ApiProperty({ type: PeriodProgressDto })
  daily!: PeriodProgressDto;

  @ApiProperty({ type: PeriodProgressDto })
  weekly!: PeriodProgressDto;

  @ApiProperty({ type: PeriodProgressDto })
  monthly!: PeriodProgressDto;

  @ApiProperty({ type: PeriodProgressDto })
  quarterly!: PeriodProgressDto;

  @ApiProperty({ type: PeriodProgressDto })
  yearly!: PeriodProgressDto;
}
