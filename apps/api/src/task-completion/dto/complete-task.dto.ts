import { IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteTaskDto {
  @ApiProperty({ type: Number })
  @IsInt()
  blockId!: number;
}
