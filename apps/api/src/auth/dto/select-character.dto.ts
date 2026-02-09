import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class SelectCharacterDto {
  @ApiProperty({ type: Number })
  @IsInt()
  characterId!: number;
}
