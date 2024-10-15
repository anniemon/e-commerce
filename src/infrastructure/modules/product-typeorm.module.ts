import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '@infrastructure/typeorm/entities';
import { ProductTypeOrmRepository } from '@infrastructure/typeorm/repositories';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductTypeOrmRepository],
  exports: [ProductTypeOrmRepository],
})
export class ProductTypeOrmModule {}
