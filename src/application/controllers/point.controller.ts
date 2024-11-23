import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { PointDto } from '../dtos';
import { UserPointEntity } from '@domain/entities';
import { PointService } from '@domain/services';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Point')
@Controller('/points')
export class PointController {
  constructor(private readonly pointService: PointService) {}

  @Get('/balance')
  async getUserBalance(
    @Query(
      'userId',
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    userId: number,
  ): Promise<UserPointEntity> {
    return await this.pointService.getUserBalance(userId);
  }

  @Post('/charge')
  async chargePoint(@Body() pointDto: PointDto): Promise<UserPointEntity> {
    return await this.pointService.chargePoint(pointDto);
  }
}
