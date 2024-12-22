import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class PointDto {
  @ApiProperty({
    default: 1000,
  })
  @IsInt()
  @IsPositive({ message: '금액은 0보다 커야 합니다.' })
  amount: number;

  @ApiProperty({
    default: 1,
  })
  @IsInt()
  @IsPositive()
  userId: number;
}
