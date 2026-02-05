import {
  IsString,
  IsOptional,
  IsInt,
  IsIn,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateTaskOptionDto } from './update-task-option.dto';

export class UpdateTaskDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  desc?: string | null;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @Min(0)
  xpReward?: number;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @Min(0)
  coinReward?: number;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @ApiPropertyOptional({ enum: ['minutes'], nullable: true })
  @IsOptional()
  @IsIn(['minutes'])
  goalUnit?: 'minutes' | null;

  @ApiPropertyOptional({ type: [UpdateTaskOptionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateTaskOptionDto)
  options?: UpdateTaskOptionDto[];
}
