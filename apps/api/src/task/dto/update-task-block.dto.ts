import { IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskBlockDto } from './create-task-block.dto';

export class UpdateTaskBlockDto extends CreateTaskBlockDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}
