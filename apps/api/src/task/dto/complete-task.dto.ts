import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteTaskDto {
  @ApiProperty()
  @IsUUID()
  userId!: string;
}
