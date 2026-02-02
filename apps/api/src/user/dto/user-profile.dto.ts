import { ApiProperty } from '@nestjs/swagger';
import { UserDetailDto } from './user-detail.dto';

/** Extends the base user detail with game-related stats. */
export class UserProfileDto extends UserDetailDto {
  @ApiProperty()
  level!: number;

  @ApiProperty()
  xp!: number;

  @ApiProperty()
  coins!: number;
}
