import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ type: String, format: 'date-time' })
  tokenExpiresAt!: string;
}
