import { Module } from '@nestjs/common';
import { ProductTypeOrmModule } from '@infrastructure/modules';
import { ProductRepository, StockRepository } from '@domain/repositories';
import { ProductFacade } from '@domain/usecase/product.facade';
import { ProductService } from '@domain/services';
import { ProductController } from '@application/controllers';

@Module({
  imports: [ProductTypeOrmModule],
  controllers: [ProductController],
  providers: [
    ProductFacade,
    ProductService,
    ProductRepository,
    StockRepository,
  ],
  exports: [ProductService],
})
export class ProductModule {}
