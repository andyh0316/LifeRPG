import {
  IsString,
  IsIn,
  IsInt,
  IsArray,
  ValidateNested,
  ValidateIf,
  MaxLength,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateTaskBlockDto } from './update-task-block.dto';

export class UpdateTaskDto {
  @ApiProperty({ type: String })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  @ValidateIf((o) => o.desc !== null)
  @IsString()
  desc!: string | null;

  @ApiProperty({ type: String, nullable: true })
  @ValidateIf((o) => o.icon !== null)
  @IsString()
  @MaxLength(50)
  icon!: string | null;

  @ApiProperty({ enum: ['count', 'minutes'] })
  @IsIn(['count', 'minutes'])
  amountUnit!: 'count' | 'minutes';

  @ApiProperty({ type: Number, nullable: true })
  @ValidateIf((o) => o.goalAmount !== null)
  @IsInt()
  goalAmount!: number | null;

  @ApiProperty({
    enum: ['day-long', 'week-long', 'month-long'],
    nullable: true,
  })
  @ValidateIf((o) => o.goalPeriod !== null)
  @IsIn(['day-long', 'week-long', 'month-long'])
  goalPeriod!: 'day-long' | 'week-long' | 'month-long' | null;

  @ApiProperty({ type: [UpdateTaskBlockDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateTaskBlockDto)
  blocks!: UpdateTaskBlockDto[];
}
