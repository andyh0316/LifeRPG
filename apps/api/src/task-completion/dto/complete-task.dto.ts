import { IsInt, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteTaskDto {
  @ApiProperty({ type: Number })
  @IsInt()
  blockId!: number;

  @ApiProperty({
    type: String,
    description: 'Client-local completion timestamp (ISO 8601)',
    example: '2026-02-18T10:00:00+08:00',
  })
  @IsISO8601()
  completedAt!: string;
}
