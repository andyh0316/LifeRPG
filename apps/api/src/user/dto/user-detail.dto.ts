import { ApiProperty } from '@nestjs/swagger';

export class UserDetailDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  level!: number;

  @ApiProperty()
  xp!: number;

  @ApiProperty()
  coins!: number;

  @ApiProperty({ type: Date, nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  updatedAt!: Date | null;
}
