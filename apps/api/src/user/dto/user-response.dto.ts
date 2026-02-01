import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty({ type: Date, nullable: true })
  createdAt!: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  updatedAt!: Date | null;
}
