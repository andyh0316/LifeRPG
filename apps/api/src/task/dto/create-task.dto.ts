import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  IsArray,
  ValidateNested,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskBlockDto } from './create-task-block.dto';

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  desc?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @ApiPropertyOptional({ enum: ['count', 'minutes'] })
  @IsOptional()
  @IsIn(['count', 'minutes'])
  amountUnit?: 'count' | 'minutes';

  @ApiPropertyOptional({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  goalAmount?: number | null;

  @ApiPropertyOptional({
    enum: ['day-long', 'week-long', 'month-long'],
    nullable: true,
  })
  @IsOptional()
  @IsIn(['day-long', 'week-long', 'month-long'])
  goalPeriod?: 'day-long' | 'week-long' | 'month-long' | null;

  @ApiPropertyOptional({ type: [CreateTaskBlockDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTaskBlockDto)
  blocks?: CreateTaskBlockDto[];
}
