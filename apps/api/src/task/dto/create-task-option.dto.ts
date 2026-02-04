import { IsOptional, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskOptionDto {
  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  goal?: number | null;

  @ApiPropertyOptional({ type: Number, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @ApiPropertyOptional({ type: Number, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  coinReward?: number;
}
