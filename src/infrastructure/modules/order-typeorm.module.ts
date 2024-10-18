import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order, OrderItem } from '@infrastructure/typeorm/entities';
import { OrderTypeOrmRepository } from '@infrastructure/typeorm/repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [OrderTypeOrmRepository],
  exports: [OrderTypeOrmRepository],
})
export class OrderTypeOrmModule {}
