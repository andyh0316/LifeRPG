import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ type: String, format: 'date-time' })
  accessTokenExpiresAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  refreshTokenExpiresAt!: string;
}
