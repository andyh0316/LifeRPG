import {
  IsString,
  IsIn,
  IsInt,
  ValidateIf,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemDto {
  @ApiProperty({ type: String })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ type: String, nullable: true })
  @ValidateIf((o) => o.desc !== null)
  @IsString()
  desc!: string | null;

  @ApiProperty({ type: String, nullable: true })
  @ValidateIf((o) => o.icon !== null)
  @IsString()
  @MaxLength(50)
  icon!: string | null;

  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiProperty({ enum: ['count', 'minutes', 'hours', 'days'] })
  @IsIn(['count', 'minutes', 'hours', 'days'])
  amountUnit!: 'count' | 'minutes' | 'hours' | 'days';
}
