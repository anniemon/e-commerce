import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class PointDto {
  @ApiProperty({
    default: 1000,
  })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({
    default: 1,
  })
  @IsInt()
  @IsPositive()
  userId: number;
}
