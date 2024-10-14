import { Controller, Get, Query } from '@nestjs/common';
import { ProductFacade } from '@domain/usecase/product.facade';

@Controller('products')
export class ProductController {
  constructor(private readonly productFacade: ProductFacade) {}

  @Get()
  async getProductByIdWithStock(@Query('productId') productId: number) {
    return this.productFacade.getProductByIdWithStock(productId);
  }
}
