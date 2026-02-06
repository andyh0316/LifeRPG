import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskBlockDto } from './create-task-block.dto';

export class TaskTemplateDto {
  @ApiProperty({ type: String })
  key!: string;

  @ApiProperty({ type: String })
  label!: string;

  @ApiProperty({ type: String })
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  desc?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  icon?: string | null;

  @ApiPropertyOptional({ enum: ['minutes'], nullable: true })
  amountUnit?: 'minutes' | null;

  @ApiProperty({ type: [CreateTaskBlockDto] })
  blocks!: CreateTaskBlockDto[];
}
