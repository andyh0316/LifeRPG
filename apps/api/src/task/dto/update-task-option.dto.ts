import { IsOptional, IsInt, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTaskOptionDto } from './create-task-option.dto';

export class UpdateTaskOptionDto extends CreateTaskOptionDto {
  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  delete?: boolean;
}
