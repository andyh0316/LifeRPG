import { ApiProperty } from '@nestjs/swagger';

export class CharacterSummaryDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty({ type: Number })
  level!: number;

  @ApiProperty({ type: Number })
  xp!: number;

  @ApiProperty({ type: Number })
  coins!: number;
}
