import { ApiProperty } from '@nestjs/swagger';

export class CharacterSummaryItemDto {
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

export class CharacterSummaryResponseDto {
  @ApiProperty({ type: Number })
  activeCharacterId!: number;

  @ApiProperty({ type: [CharacterSummaryItemDto] })
  characters!: CharacterSummaryItemDto[];
}
