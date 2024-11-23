import { Module } from '@nestjs/common';
import { PointController } from '@application/controllers';
import { PointTypeOrmModule } from '@infrastructure/modules';
import { PointService } from '@domain/services';
import {
  PointTransactionRepository,
  UserRepository,
} from '@domain/repositories';

@Module({
  imports: [PointTypeOrmModule],
  controllers: [PointController],
  providers: [PointService, UserRepository, PointTransactionRepository],
  exports: [PointService],
})
export class PointModule {}
