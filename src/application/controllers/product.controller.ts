import { Controller, Get, Param } from '@nestjs/common';
import { ProductFacade } from '@domain/usecase/product.facade';

@Controller('products')
export class ProductController {
  constructor(private readonly productFacade: ProductFacade) {}

  @Get(':productId')
  async getProductByIdWithStock(@Param('productId') productId: number) {
    return this.productFacade.getProductByIdWithStock(productId);
  }
}
