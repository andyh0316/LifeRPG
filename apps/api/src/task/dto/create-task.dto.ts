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

  @ApiPropertyOptional({ enum: ['minutes'], nullable: true })
  @IsOptional()
  @IsIn(['minutes'])
  amountUnit?: 'minutes' | null;

  @ApiPropertyOptional({ type: [CreateTaskBlockDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateTaskBlockDto)
  blocks?: CreateTaskBlockDto[];
}
