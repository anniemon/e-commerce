import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Stock } from '@infrastructure/typeorm/entities';
import {
  ProductTypeOrmRepository,
  StockTypeOrmRepository,
} from '@infrastructure/typeorm/repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Stock])],
  providers: [ProductTypeOrmRepository, StockTypeOrmRepository],
  exports: [ProductTypeOrmRepository, StockTypeOrmRepository],
})
export class ProductTypeOrmModule {}
