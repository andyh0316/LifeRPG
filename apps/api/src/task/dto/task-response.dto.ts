import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskBlockResponseDto } from './task-block-response.dto';

export class TaskResponseDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: Number })
  userId!: number;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  desc!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  icon!: string | null;

  @ApiProperty({ type: Number })
  sortOrder!: number;

  @ApiProperty({ enum: ['count', 'minutes'] })
  amountUnit!: string;

  @ApiProperty({ type: [TaskBlockResponseDto] })
  blocks!: TaskBlockResponseDto[];
}
