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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskOptionDto } from './create-task-option.dto';

export class CreateTaskDto {
  @ApiProperty({ type: Number })
  @IsInt()
  userId!: number;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  desc?: string | null;

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

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @ApiPropertyOptional({ enum: ['minutes'], nullable: true })
  @IsOptional()
  @IsIn(['minutes'])
  goalUnit?: 'minutes' | null;

  @ApiPropertyOptional({ type: [CreateTaskOptionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTaskOptionDto)
  options?: CreateTaskOptionDto[];
}
