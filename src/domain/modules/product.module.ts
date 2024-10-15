import { Module } from '@nestjs/common';
import { ProductController } from '@application/controllers/product.controller';
import { ProductTypeOrmModule } from '@infrastructure/modules';
import { ProductRepository } from '@domain/repositories/product.repository';
import { ProductFacade } from '@domain/usecase/product.facade';
import { ProductService } from '@domain/services';

@Module({
  imports: [ProductTypeOrmModule],
  controllers: [ProductController],
  providers: [ProductFacade, ProductService, ProductRepository],
})
export class ProductModule {}
