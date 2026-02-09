import { ApiProperty } from '@nestjs/swagger';

export class XpLevelDto {
  @ApiProperty()
  level!: number;

  @ApiProperty({ type: Number, nullable: true })
  xpToNext!: number | null;

  @ApiProperty()
  cumulativeXp!: number;
}
