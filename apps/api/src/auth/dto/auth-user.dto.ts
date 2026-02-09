import { ApiProperty } from '@nestjs/swagger';
import { CharacterSummaryDto } from './character-summary.dto';

export class AuthUserDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: Number })
  userCharacterId!: number;

  @ApiProperty({ type: [CharacterSummaryDto] })
  characters!: CharacterSummaryDto[];
}
