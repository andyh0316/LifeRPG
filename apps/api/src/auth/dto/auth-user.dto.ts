import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty()
  email!: string;
}
