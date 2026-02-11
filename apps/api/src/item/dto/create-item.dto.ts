import {
  IsString,
  IsOptional,
  IsIn,
  IsInt,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty()
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  desc?: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @ApiPropertyOptional({ enum: ['count', 'minutes'] })
  @IsOptional()
  @IsIn(['count', 'minutes'])
  amountUnit?: 'count' | 'minutes';
}
