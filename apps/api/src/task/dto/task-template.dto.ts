import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskBlockDto } from './create-task-block.dto';

export class TaskTemplateDto {
  @ApiProperty({ type: String })
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  desc?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  icon?: string | null;

  @ApiPropertyOptional({ enum: ['count', 'minutes'] })
  amountUnit?: 'count' | 'minutes';

  @ApiProperty({ type: [CreateTaskBlockDto] })
  blocks!: CreateTaskBlockDto[];
}
