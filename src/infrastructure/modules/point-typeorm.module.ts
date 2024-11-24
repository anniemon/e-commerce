import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, PointTransaction } from '@infrastructure/typeorm/entities';
import {
  UserTypeOrmRepository,
  PointTransactionTypeOrmRepository,
} from '@infrastructure/typeorm/repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, PointTransaction])],
  providers: [UserTypeOrmRepository, PointTransactionTypeOrmRepository],
  exports: [UserTypeOrmRepository, PointTransactionTypeOrmRepository],
})
export class PointTypeOrmModule {}
