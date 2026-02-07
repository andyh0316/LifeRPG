import {
  IsString,
  IsOptional,
  IsIn,
  IsArray,
  ValidateNested,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UpdateTaskBlockDto } from './update-task-block.dto';

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

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @ApiPropertyOptional({ enum: ['count', 'minutes'] })
  @IsOptional()
  @IsIn(['count', 'minutes'])
  amountUnit?: 'count' | 'minutes';

  @ApiPropertyOptional({ type: [UpdateTaskBlockDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateTaskBlockDto)
  blocks?: UpdateTaskBlockDto[];
}
