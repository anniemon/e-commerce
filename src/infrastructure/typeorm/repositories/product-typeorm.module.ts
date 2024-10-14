import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { ProductTypeOrmRepository } from './product.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductTypeOrmRepository],
  exports: [ProductTypeOrmRepository],
})
export class ProductTypeOrmModule {}
